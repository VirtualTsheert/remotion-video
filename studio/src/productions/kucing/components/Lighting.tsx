import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, mix, ramp } from "./geom";

// ---------------------------------------------------------------------------
// Waktu dalam sehari (tod 0..1) → semua parameter cahaya.
// 0.25 pagi · 0.45 siang · 0.68 sore keemasan · 0.82 senja · 1 malam
// ---------------------------------------------------------------------------

export type Daylight = {
  skyTop: string;
  skyBottom: string;
  sun: number; // kekuatan sinar matahari masuk jendela 0..1
  sunColor: string;
  sunShift: number; // pergeseran bercak cahaya di lantai (px dunia): pagi kanan, sore kiri
  ambient: string; // warna multiply seluruh adegan
  lamp: number; // lampu ruangan menyala 0..1
  stars: number;
};

export const daylight = (tod: number): Daylight => {
  const t = clamp01(tod);
  return {
    skyTop: ramp([[0.2, "#9DBFD8"], [0.45, "#86B1D6"], [0.68, "#C79A7A"], [0.82, "#566477"], [1, "#1B2232"]], t),
    skyBottom: ramp([[0.2, "#F5E3C2"], [0.45, "#E4ECEC"], [0.68, "#F4C687"], [0.82, "#E0936A"], [1, "#39445C"]], t),
    sun: ramp01([[0.15, 0.5], [0.35, 0.85], [0.6, 0.95], [0.74, 1], [0.84, 0.15], [0.9, 0]], t),
    sunColor: ramp([[0.2, "#FBE6BD"], [0.45, "#FFF1D6"], [0.7, "#F8C67E"], [0.82, "#F09A62"]], t),
    sunShift: mix(520, -620, clamp01((t - 0.15) / 0.65)),
    ambient: ramp([[0.2, "#EBDCC8"], [0.45, "#F4EEE6"], [0.7, "#F2D9BA"], [0.82, "#C9B4B2"], [0.9, "#8D93AE"], [1, "#6F7899"]], t),
    lamp: ramp01([[0.76, 0], [0.86, 0.85], [1, 1]], t),
    stars: ramp01([[0.85, 0], [1, 1]], t),
  };
};

function ramp01(stops: [number, number][], t: number) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, va] = stops[i];
    const [b, vb] = stops[i + 1];
    if (t <= b) return mix(va, vb, (t - a) / (b - a));
  }
  return stops[stops.length - 1][1];
}

// ---------------------------------------------------------------------------
// Sinar matahari dari jendela: berkas volumetrik + bercak di lantai dengan
// bayangan kusen. Koordinat dunia, digambar di lapisan blend "screen".
// ---------------------------------------------------------------------------

export const WINDOW = { x0: 1760, x1: 2540, y0: 360, y1: 1700 } as const;
export const FLOOR_Y = 1760;

export const SunBeams: React.FC<{ d: Daylight; id: string }> = ({ d, id }) => {
  if (d.sun < 0.02) return null;
  const { x0, x1, y0 } = WINDOW;
  const s0 = d.sunShift * 0.35;
  const s1 = d.sunShift;
  const fy0 = FLOOR_Y + 10;
  const fy1 = 2420;
  const patch = `M${x0 + s0},${fy0} L${x1 + s0},${fy0} L${x1 + s1},${fy1} L${x0 + s1},${fy1} Z`;
  const shaft = `M${x0 + 40},${y0 + 60} L${x1 - 30},${y0 + 40} L${x1 + s1},${fy1} L${x0 + s1},${fy1} Z`;
  // bayangan kusen tengah & palang horizontal pada bercak lantai
  const mx = (x0 + x1) / 2;
  const bars = [
    `M${mx - 14 + s0},${fy0} L${mx + 14 + s0},${fy0} L${mx + 30 + s1},${fy1} L${mx - 30 + s1},${fy1} Z`,
  ];
  const yb = fy0 + (fy1 - fy0) * 0.42;
  const sb = s0 + (s1 - s0) * 0.42;
  bars.push(`M${x0 + sb},${yb} L${x1 + sb},${yb} L${x1 + sb + 6},${yb + 34} L${x0 + sb + 6},${yb + 34} Z`);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-shaft`} x1="0" y1={y0} x2="0" y2={fy1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={d.sunColor} stopOpacity={0.32 * d.sun} />
          <stop offset="0.6" stopColor={d.sunColor} stopOpacity={0.12 * d.sun} />
          <stop offset="1" stopColor={d.sunColor} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-patch`} x1="0" y1={fy0} x2="0" y2={fy1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={d.sunColor} stopOpacity={0.75 * d.sun} />
          <stop offset="1" stopColor={d.sunColor} stopOpacity={0.15 * d.sun} />
        </linearGradient>
        <mask id={`${id}-bars`}>
          <rect x={-5000} y={-5000} width={20000} height={20000} fill="white" />
          {bars.map((b, i) => (
            <path key={i} d={b} fill="black" />
          ))}
        </mask>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <path d={shaft} fill={`url(#${id}-shaft)`} filter={`url(#${id}-soft)`} />
      <g mask={`url(#${id}-bars)`} filter={`url(#${id}-soft)`}>
        <path d={patch} fill={`url(#${id}-patch)`} />
      </g>
    </g>
  );
};

// Cahaya lampu malam (radial, hangat).
export const LampGlow: React.FC<{ x: number; y: number; r: number; k: number; id: string }> = ({ x, y, r, k, id }) =>
  k < 0.02 ? null : (
    <g>
      <defs>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#FFD9A0" stopOpacity={0.85 * k} />
          <stop offset="0.35" stopColor="#F8B76E" stopOpacity={0.35 * k} />
          <stop offset="1" stopColor="#F8B76E" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-lamp)`} />
    </g>
  );

// ---------------------------------------------------------------------------
// Grading layar: warna ambient (multiply), vignette, light leak.
// ---------------------------------------------------------------------------

export const Grade: React.FC<{ ambient: string; vignette?: number; leak?: number; leakX?: number; warmth?: number }> = ({
  ambient,
  vignette = 0.55,
  leak = 0,
  leakX = 0.9,
  warmth = 0,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: ambient, mixBlendMode: "multiply" }} />
    {warmth > 0 ? <AbsoluteFill style={{ backgroundColor: "#F8C98A", mixBlendMode: "soft-light", opacity: warmth }} /> : null}
    {leak > 0.01 ? (
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 45% at ${leakX * 100}% 12%, rgba(255,190,120,${0.75 * leak}), rgba(255,140,80,${0.25 * leak}) 45%, rgba(0,0,0,0) 75%)`,
          mixBlendMode: "screen",
        }}
      />
    ) : null}
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 85% at 50% 48%, rgba(0,0,0,0) 55%, rgba(25,15,8,${vignette}) 100%)`,
      }}
    />
  </AbsoluteFill>
);

// Berkas sinar diagonal (god rays) dari sumber di luar bingkai, koordinat dunia.
export const GodRays: React.FC<{
  origin: [number, number];
  angle: number; // derajat arah sinar (0 = kanan, 90 = bawah)
  length: number;
  spread?: number;
  k: number;
  color?: string;
  t: number;
  id: string;
}> = ({ origin, angle, length, spread = 26, k, color = "#FBE3B0", t, id }) => {
  if (k < 0.02) return null;
  const rays = [-1, -0.55, -0.15, 0.3, 0.7, 1.05];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={0.75} />
          <stop offset="0.75" stopColor={color} stopOpacity={0.22} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
      </defs>
      <g transform={`translate(${origin[0]},${origin[1]})`} filter={`url(#${id}-blur)`}>
        {rays.map((r, i) => {
          const a = angle + r * spread * 0.5;
          const w = 90 + (i % 3) * 70;
          const flicker = 0.65 + 0.35 * Math.sin(t * (0.4 + i * 0.13) + i * 2);
          return (
            <g key={i} transform={`rotate(${a})`} opacity={k * flicker}>
              <path d={`M0,${-w * 0.2} L${length},${-w} L${length},${w} L0,${w * 0.2} Z`} fill={`url(#${id}-ray)`} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// Bercak hangat sinar matahari di atas subjek (blend screen).
export const SunPatch: React.FC<{ x: number; y: number; r: number; k: number; color?: string }> = ({ x, y, r, k, color = "#FFD9A0" }) => (
  <g>
    <defs>
      <radialGradient id={`patch${Math.round(x)}${Math.round(y)}`}>
        <stop offset="0" stopColor={color} stopOpacity={0.6 * k} />
        <stop offset="0.5" stopColor={color} stopOpacity={0.25 * k} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.7} fill={`url(#patch${Math.round(x)}${Math.round(y)})`} />
  </g>
);
