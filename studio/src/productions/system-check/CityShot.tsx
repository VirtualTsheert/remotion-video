import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";

// Uji 3D: blok kota prosedural dengan kamera dolly + crane turun.
// Tujuan: memastikan WebGL software (swangle) cukup cepat di Codespace.
export const CityShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const blocks = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => {
        const x = (i % 12) - 5.5;
        const z = Math.floor(i / 12) - 5;
        const h = 0.3 + random(`h-${i}`) * 2.2;
        return { x: x * 1.4, z: z * 1.4, h };
      }),
    [],
  );

  const t = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: EASE.inOut });
  const camZ = interpolate(t, [0, 1], [14, 6]);
  const camY = interpolate(t, [0, 1], [9, 3.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 45, position: [0, camY, camZ] }}
      >
        <color attach="background" args={[COLORS.night]} />
        <fog attach="fog" args={[COLORS.night, 8, 26]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 4]} intensity={1.4} color="#ffd9a8" />
        <CameraRig y={camY} z={camZ} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={COLORS.steel} />
        </mesh>
        {blocks.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[1, b.h, 1]} />
            <meshStandardMaterial color={i === 64 ? COLORS.accent : COLORS.paperDark} />
          </mesh>
        ))}
      </ThreeCanvas>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// Kamera diperbarui setiap frame dari props (bukan useFrame), agar deterministik.
const CameraRig: React.FC<{ y: number; z: number }> = ({ y, z }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(0, y, z);
  camera.lookAt(0, 0.5, 0);
  return null;
};
