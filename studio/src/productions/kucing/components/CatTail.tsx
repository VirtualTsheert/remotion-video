import React from "react";
import { noise2D } from "@remotion/noise";
import { type Pt, add, limb, mul, rad, sub, len } from "./geom";
import type { Living, Pose } from "./CatAnimation";
import { type Rig, spinePt } from "./CatBody";
import { FUR } from "./palette";

const N = 13;
const SEG = 15.5;

// Ekor: rantai 13 ruas. Sudut tiap ruas = pangkal + lengkungan bertahap +
// gelombang yang merambat ke ujung (ayunan alami) + noise kecil.
export const tailPoints = (rig: Rig, p: Pose, lv: Living): Pt[] => {
  const base = spinePt(rig, -rig.haunch * 0.78, rig.haunch * 0.32);
  const pts: Pt[] = [base];
  let cur = base;
  let grounded = 0; // arah tetap setelah ekor menyentuh lantai
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    const wave = p.tailW * Math.sin(lv.t * 1.7 - i * 0.42) * u;
    const drift = noise2D("tail", lv.t * 0.25, i * 0.05) * 6 * u;
    const th = rad(p.tailA + p.tailC * u * u * 0.6 + p.tailC * u * 0.4 + wave + drift);
    const dir: Pt = [-Math.cos(th), -Math.sin(th)];
    let next = add(cur, mul(dir, SEG));
    // Ekor yang menyentuh lantai bergeser di sepanjang lantai, tidak menembusnya.
    if (grounded !== 0 || next[1] > -8) {
      // Menyusuri lantai: melingkar ke depan bila lengkungnya negatif (memeluk badan).
      if (grounded === 0) grounded = p.tailC < -60 ? 1 : Math.sign(dir[0]) || -1;
      const lift = Math.max(0, -dir[1]) * SEG * 0.5; // ujung ekor boleh terangkat sedikit
      next = [cur[0] + grounded * SEG * 0.97, Math.min(-8, cur[1] - lift)];
    }
    pts.push(next);
    cur = next;
  }
  return pts;
};

export const CatTail: React.FC<{ pts: Pt[]; id: string }> = ({ pts, id }) => {
  const widths = pts.map((_, i) => 25 - (i / (pts.length - 1)) * 13);
  const d = limb(pts, widths);
  return (
    <g>
      <defs>
        <clipPath id={`${id}-tailClip`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={FUR.base} />
      <g clipPath={`url(#${id}-tailClip)`}>
        {/* sisi atas ekor lebih gelap */}
        <path d={limb(pts.map((p) => [p[0], p[1] - 6] as Pt), widths.map((w) => w * 0.6))} fill={FUR.top} opacity={0.55} />
        {/* cincin belang, makin rapat ke ujung */}
        {pts.slice(1).map((p, i) => {
          if (i % 2 === 1) return null;
          const a = pts[i];
          const dv = sub(p, a);
          const l = len(dv) || 1;
          const n: Pt = [-dv[1] / l, dv[0] / l];
          return (
            <path
              key={i}
              d={limb([add(p, mul(n, 16)), add(p, mul(n, -16))], [7.5, 6])}
              fill={FUR.stripe}
              opacity={0.85}
            />
          );
        })}
        {/* ujung ekor gelap */}
        <path d={limb(pts.slice(-3), [14, 13, 12])} fill={FUR.stripeDark} opacity={0.9} />
      </g>
      <path d={d} fill="none" stroke="#5A2E12" strokeOpacity={0.3} strokeWidth={1.4} />
    </g>
  );
};
