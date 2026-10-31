import React, { useLayoutEffect, useMemo, useRef } from "react";
import { random, useCurrentFrame } from "remotion";
import { cameraStateAt, type Camera3DPath } from "../camera/CameraRig3D";
import { Color, Object3D, type InstancedMesh } from "three";
import { COLORS } from "../../theme/tokens";

export type Building = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  accent?: boolean;
};

// Kota prosedural bergaya maket rekonstruksi: blok monokrom di atas grid,
// satu atau beberapa gedung diberi warna aksen sebagai lokasi kejadian.
export const cityLayout = (
  opts: { blocks?: number; seed?: string; accent?: [number, number][] } = {},
): Building[] => {
  const n = opts.blocks ?? 14;
  const seed = opts.seed ?? "city";
  const out: Building[] = [];
  for (let gx = 0; gx < n; gx++) {
    for (let gz = 0; gz < n; gz++) {
      // Jalan setiap 4 blok.
      if (gx % 4 === 0 || gz % 4 === 0) continue;
      const r = random(`${seed}-${gx}-${gz}`);
      const center = 1 - Math.hypot(gx - n / 2, gz - n / 2) / n;
      out.push({
        x: (gx - n / 2) * 1.3,
        z: (gz - n / 2) * 1.3,
        w: 0.8 + random(`${seed}w${gx}${gz}`) * 0.3,
        d: 0.8 + random(`${seed}d${gx}${gz}`) * 0.3,
        h: 0.3 + r * r * 2.5 * (0.4 + center),
        accent: opts.accent?.some(([ax, az]) => ax === gx && az === gz),
      });
    }
  }
  return out;
};

type Vec3 = [number, number, number];

// Apakah segmen p→q memotong kotak gedung (uji slab AABB).
const blocks = (b: Building, p: Vec3, q: Vec3) => {
  const min = [b.x - b.w / 2, 0, b.z - b.d / 2];
  const max = [b.x + b.w / 2, b.h, b.z + b.d / 2];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 3; i++) {
    const d = q[i] - p[i];
    if (Math.abs(d) < 1e-9) {
      if (p[i] < min[i] || p[i] > max[i]) return false;
      continue;
    }
    let a = (min[i] - p[i]) / d;
    let c = (max[i] - p[i]) / d;
    if (a > c) [a, c] = [c, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, c);
    if (t0 > t1) return false;
  }
  return true;
};

const Instances: React.FC<{
  items: Building[];
  color: string;
  accentColor: string;
}> = ({ items, color, accentColor }) => {
  const ref = useRef<InstancedMesh>(null);
  const tmp = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const base = new Color(color);
    const accent = new Color(accentColor);
    items.forEach((b, i) => {
      tmp.position.set(b.x, b.h / 2, b.z);
      tmp.scale.set(b.w, b.h, b.d);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      mesh.setColorAt(i, b.accent ? accent : base);
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items, color, accentColor, tmp]);
  if (items.length === 0) return null;
  return (
    // Kapasitas tetap besar agar mesh tidak dibuat ulang saat jumlah berubah.
    <instancedMesh ref={ref} args={[undefined, undefined, 512]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
};

const GHOST_OPACITY = 0.14;
const FADE_WINDOW = 8;

// Gedung yang menghalangi garis pandang kamera → `subject` dibuat transparan
// (gaya "x-ray" rekonstruksi), sehingga subjek selalu terlihat ke mana pun kamera bergerak.
// Opasitas = porsi frame di sekitar frame ini (±8) saat gedung menghalangi, sehingga
// gedung memudar masuk/keluar alih-alih berkedip. Butuh `cameraPath` yang sama dengan rig.
export const CityModel: React.FC<{
  buildings: Building[];
  subject?: Vec3;
  cameraPath?: Camera3DPath;
  color?: string;
  accentColor?: string;
}> = ({
  buildings,
  subject,
  cameraPath,
  color = COLORS.paperDark,
  accentColor = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const solid: Building[] = [];
  const fading: { b: Building; opacity: number }[] = [];
  const cams =
    subject && cameraPath
      ? Array.from(
          { length: FADE_WINDOW * 2 + 1 },
          (_, i) => cameraStateAt(cameraPath, frame - FADE_WINDOW + i).position,
        )
      : [];
  for (const b of buildings) {
    const hits = b.accent
      ? 0
      : cams.filter((c) => blocks(b, c, subject!)).length;
    if (hits === 0) solid.push(b);
    else
      fading.push({
        b,
        opacity: 1 - (1 - GHOST_OPACITY) * (hits / cams.length),
      });
  }
  return (
    <>
      <Instances items={solid} color={color} accentColor={accentColor} />
      {fading.map(({ b, opacity }, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} scale={[b.w, b.h, b.d]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={opacity > 0.95}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshLambertMaterial color="#1c222b" />
      </mesh>
      <gridHelper
        args={[40, 31, "#3a4452", "#262d38"]}
        position={[0, 0.005, 0]}
      />
    </>
  );
};
