import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F, OUTLINE } from "./ui";

const hexPoints = (r: number, cx = 0, cy = 0) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

// Latar krem dengan pola heksagon samar.
export const CreamBg: React.FC<{ color?: string; pattern?: string; offset?: number }> = ({ color = C.cream, pattern = "rgba(199,119,0,0.10)", offset = 0 }) => {
  const id = `hexbg-${pattern.replace(/[^a-z0-9]/gi, "")}`;
  return (
  <AbsoluteFill style={{ background: color }}>
    <svg width="1080" height="1920" style={{ position: "absolute" }}>
      <defs>
        <pattern id={id} width="104" height="180" patternUnits="userSpaceOnUse" patternTransform={`translate(${offset} ${offset * 0.6})`}>
          <polygon points={hexPoints(58, 52, 30)} fill="none" stroke={pattern} strokeWidth="5" />
          <polygon points={hexPoints(58, 0, 120)} fill="none" stroke={pattern} strokeWidth="5" />
          <polygon points={hexPoints(58, 104, 120)} fill="none" stroke={pattern} strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id})`} />
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.55), transparent 65%)" }} />
  </AbsoluteFill>
  );
};

// Sendok teh berisi madu (tampak 3/4). `fill` 0–1 = tinggi madu.
// Titik bibir sendok (asal tetesan) ada di SPOON_LIP.
export const SPOON_LIP = { x: 470, y: 1312 };

export const Spoon: React.FC<{ fill?: number; x?: number; y?: number; scale?: number; children?: React.ReactNode }> = ({ fill = 1, x = 0, y = 0, scale = 1, children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <defs>
      <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F1F4F6" />
        <stop offset="0.55" stopColor="#C4CCD3" />
        <stop offset="1" stopColor="#8E99A3" />
      </linearGradient>
      <radialGradient id="honeyFill" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FFD27A" />
        <stop offset="0.5" stopColor={C.honey} />
        <stop offset="1" stopColor={C.amber} />
      </radialGradient>
    </defs>
    <g transform={`translate(${x} ${y}) translate(540 1180) scale(${scale}) translate(-540 -1180)`}>
      {/* gagang */}
      <path d="M720 1120 L1180 860 Q1210 846 1222 872 Q1230 896 1200 910 L752 1200 Z" fill="url(#steel)" stroke={C.ink} strokeWidth={OUTLINE} strokeLinejoin="round" />
      {/* mangkuk */}
      <ellipse cx="540" cy="1180" rx="250" ry="150" fill="url(#steel)" stroke={C.ink} strokeWidth={OUTLINE} />
      <ellipse cx="540" cy="1170" rx="214" ry="118" fill="#B9C2CA" />
      {fill > 0 ? (
        <g>
          <ellipse cx="540" cy={1170 + (1 - fill) * 30} rx={214 * (0.55 + 0.45 * fill)} ry={118 * (0.55 + 0.45 * fill)} fill="url(#honeyFill)" stroke={C.amber} strokeWidth={4} />
          <ellipse cx={480} cy={1120 + (1 - fill) * 30} rx={70 * fill} ry={22 * fill} fill="rgba(255,255,255,0.55)" transform="rotate(-12 480 1120)" />
        </g>
      ) : null}
      {children}
    </g>
  </svg>
);

// Tetesan madu menggantung dari bibir sendok. Siklus 150 frame (5 dtk) agar
// adegan penutup bisa kembali tepat ke frame pertama.
export const DRIP_PERIOD = 150;
export const Drip: React.FC<{ phase: number }> = ({ phase }) => {
  const p = ((phase % DRIP_PERIOD) + DRIP_PERIOD) % DRIP_PERIOD;
  const { x: ox, y: oy } = SPOON_LIP;
  let L: number;
  let fallY = 0;
  if (p < 30) L = 60 + (50 * p) / 30;
  else {
    L = (60 * (p - 30)) / 120;
    fallY = p < 60 ? 0.5 * 7 * (p - 30) ** 2 : 9999;
  }
  const r = 14 + Math.min(L, 110) * 0.09;
  const neck = `M${ox - 16},${oy} C${ox - 10},${oy + L * 0.5} ${ox - r},${oy + L - r * 0.4} ${ox - r},${oy + L} A${r} ${r} 0 1 0 ${ox + r},${oy + L} C${ox + r},${oy + L - r * 0.4} ${ox + 10},${oy + L * 0.5} ${ox + 16},${oy} Z`;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={neck} fill={C.honey} stroke={C.amber} strokeWidth={3} />
      <circle cx={ox - r * 0.35} cy={oy + L - r * 0.2} r={r * 0.3} fill="rgba(255,255,255,0.6)" />
      {p >= 30 && fallY < 900 ? (
        <g transform={`translate(${ox} ${oy + 110 + fallY})`}>
          <path d="M0 -34 C8 -18 24 -4 24 12 A24 24 0 1 1 -24 12 C-24 -4 -8 -18 0 -34 Z" fill={C.honey} stroke={C.amber} strokeWidth={3} />
          <circle cx={-8} cy={8} r={6} fill="rgba(255,255,255,0.6)" />
        </g>
      ) : null}
    </svg>
  );
};

// Tetes madu (tetesan air mata) berpusat di (0,0), tinggi ±2.4r.
export const HoneyDrop: React.FC<{ r: number; x: number; y: number; glow?: number; opacity?: number }> = ({ r, x, y, glow = 0, opacity = 1 }) => (
  <svg width={r * 6} height={r * 6} viewBox="-30 -30 60 60" style={{ position: "absolute", left: x - r * 3, top: y - r * 3, overflow: "visible", opacity }}>
    {glow > 0 ? <circle r={22} fill={`rgba(255,214,110,${0.45 * glow})`} /> : null}
    {glow > 0 ? <circle r={14} fill={`rgba(255,236,170,${0.5 * glow})`} /> : null}
    <path d="M0 -14 C3 -8 10 -2 10 4 A10 10 0 1 1 -10 4 C-10 -2 -3 -8 0 -14 Z" fill={C.honey} stroke={C.ink} strokeWidth={1.6} />
    <ellipse cx={-3.5} cy={3} rx={2.4} ry={3.4} fill="rgba(255,255,255,0.7)" />
  </svg>
);

// Kilau bintang 4 sudut.
export const Sparkle: React.FC<{ x: number; y: number; size: number; t: number; color?: string }> = ({ x, y, size, t, color = C.white }) => {
  const s = 0.6 + 0.4 * Math.abs(Math.sin(t * 5));
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `scale(${s}) rotate(${t * 40}deg)` }}>
      <path d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill={color} />
    </svg>
  );
};

const PETALS = ["#F78FB3", "#FFFFFF", "#B892FF", "#FF9F6B"];

// Bunga tampak atas (untuk peta taman).
export const Flower: React.FC<{ x: number; y: number; size?: number; hue?: number; visited?: number; rot?: number }> = ({ x, y, size = 1, hue = 0, visited = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size * (1 + 0.15 * Math.sin(visited * Math.PI))})`}>
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 22} cy={Math.sin(a) * 22} r={18} fill={PETALS[hue % 4]} stroke={C.ink} strokeWidth={4} />;
    })}
    <circle r={15} fill={visited > 0 ? C.amber : "#FFD84D"} stroke={C.ink} strokeWidth={4} />
  </g>
);

// Toples madu 500 g.
export const Jar: React.FC<{ fill: number; x: number; y: number; scale: number; opacity?: number }> = ({ fill, x, y, scale, opacity = 1 }) => {
  const top = 120;
  const bottom = 520;
  const level = bottom - (bottom - top - 20) * fill;
  return (
    <svg width="440" height="560" viewBox="0 0 440 560" style={{ position: "absolute", left: x - 220, top: y - 280, transform: `scale(${scale})`, opacity, overflow: "visible" }}>
      <defs>
        <clipPath id="jarIn">
          <path d="M70 120 Q40 140 40 200 V470 Q40 530 100 530 H340 Q400 530 400 470 V200 Q400 140 370 120 Z" />
        </clipPath>
      </defs>
      <rect x="90" y="40" width="260" height="70" rx="18" fill={C.amber} stroke={C.ink} strokeWidth={OUTLINE * 1.4} />
      <path d="M70 120 Q40 140 40 200 V470 Q40 530 100 530 H340 Q400 530 400 470 V200 Q400 140 370 120 Z" fill="rgba(255,255,255,0.55)" />
      <g clipPath="url(#jarIn)">
        <rect x="0" y={level} width="440" height="600" fill={C.honey} />
        <path d={`M0 ${level} Q110 ${level - 14} 220 ${level} T440 ${level}`} fill={C.honey} stroke={C.amber} strokeWidth="6" />
      </g>
      <path d="M70 120 Q40 140 40 200 V470 Q40 530 100 530 H340 Q400 530 400 470 V200 Q400 140 370 120 Z" fill="none" stroke={C.ink} strokeWidth={OUTLINE * 1.4} />
      <rect x="95" y="270" width="250" height="130" rx="22" fill={C.cream} stroke={C.ink} strokeWidth={OUTLINE} />
      <text x="220" y="358" textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize="74" fill={C.ink}>
        500 g
      </text>
      <path d="M80 200 Q70 300 80 420" stroke="rgba(255,255,255,0.8)" strokeWidth="14" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Bola dunia datar; benua bergeser horizontal (rotasi).
const CONTINENTS = [
  "M-60 -140 q60 -40 120 -10 q30 30 -10 60 q-40 20 -30 70 q10 50 -40 40 q-60 -10 -60 -70 q0 -60 20 -90 z",
  "M80 -60 q70 -10 90 40 q10 60 -40 80 q-40 10 -50 60 q-20 40 -50 0 q-20 -50 10 -100 q10 -60 40 -80 z",
  "M-170 60 q40 -20 70 10 q20 40 -20 70 q-40 20 -60 -20 q-10 -40 10 -60 z",
  "M20 120 q50 -10 70 20 q-10 40 -60 40 q-40 -20 -10 -60 z",
];
export const Globe: React.FC<{ r: number; x: number; y: number; spin: number }> = ({ r, x, y, spin }) => {
  const shift = ((spin % 1) + 1) % 1;
  return (
    <svg width={r * 2} height={r * 2} viewBox="-200 -200 400 400" style={{ position: "absolute", left: x - r, top: y - r, overflow: "visible" }}>
      <clipPath id="globeClip">
        <circle r="190" />
      </clipPath>
      <circle r="190" fill="#5BB8E8" />
      <g clipPath="url(#globeClip)">
        {[-1, 0, 1].map((k) => (
          <g key={k} transform={`translate(${(k + shift) * 480 - 0} 0)`}>
            {CONTINENTS.map((d, i) => (
              <path key={i} d={d} fill={C.leaf} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
            ))}
          </g>
        ))}
        <circle cx="70" cy="70" r="200" fill="rgba(0,0,0,0.12)" />
        <ellipse cx="-70" cy="-80" rx="60" ry="34" fill="rgba(255,255,255,0.35)" transform="rotate(-30 -70 -80)" />
      </g>
      <circle r="190" fill="none" stroke={C.ink} strokeWidth="8" />
    </svg>
  );
};

// Sel heksagon sarang untuk adegan Sarang.
export const HexCell: React.FC<{ x: number; y: number; r: number; fill: string; children?: React.ReactNode }> = ({ x, y, r, fill, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <polygon points={hexPoints(r)} fill={fill} stroke={C.amber} strokeWidth={8} strokeLinejoin="round" />
    <polygon points={hexPoints(r * 0.78)} fill="rgba(0,0,0,0.06)" />
    {children}
  </g>
);

export { hexPoints };
