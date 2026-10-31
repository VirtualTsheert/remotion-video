import React from "react";
import { C, F } from "./ui";
import { EPISODE } from "./data";

// Karakter Lebah #37.214. Satu komponen untuk semua adegan.
// - wingDamage 0–1: tepi sayap "digigit" makin banyak (cuil) seiring umur.
// - mood: ekspresi lewat mata & alis (tanpa mulut).
// - look: arah pandang pupil (-1..1).
// - flap: "blur" (terbang cepat), "slow" (kepakan berat/tua), "still".

export type Mood = "neutral" | "happy" | "sad" | "worried" | "determined" | "flat";

const BITES = [1.08, 1.62, 1.3, 1.85, 1.18, 1.5, 1.72, 1.4, 1.95, 1.0]; // × π, urutan munculnya robekan

const wingPath = (rx: number, ry: number, damage: number) => {
  const N = 120;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    let f = 1;
    BITES.forEach((b, k) => {
      const a = Math.min(1, Math.max(0, (damage - k / BITES.length) * BITES.length));
      if (a <= 0) return;
      let d = Math.abs(th - b * Math.PI);
      d = Math.min(d, Math.PI * 2 - d);
      const w = 0.16 + (k % 3) * 0.04;
      if (d < w) f -= a * (0.28 + (k % 2) * 0.1) * Math.pow(1 - d / w, 1.4);
    });
    const x = rx * Math.cos(th) * f;
    const y = -ry + ry * Math.sin(th) * f;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
};

const Wing: React.FC<{ angle: number; damage: number; opacity?: number; mirror?: boolean }> = ({ angle, damage, opacity = 1, mirror }) => (
  <g transform={`translate(${mirror ? 30 : -30} -40) scale(${mirror ? -1 : 1} 1) rotate(${-28 + angle})`} opacity={opacity}>
    <path d={wingPath(46, 40, damage)} fill="rgba(220,242,255,0.72)" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M0 -6 Q-10 -40 -28 -62 M0 -8 Q8 -40 18 -60" stroke={C.ink} strokeWidth={2} fill="none" opacity={0.35} />
  </g>
);

const BROWS: Record<Mood, { angle: number; y: number }> = {
  neutral: { angle: 0, y: 0 },
  happy: { angle: -8, y: -6 },
  sad: { angle: 22, y: -2 },
  worried: { angle: 16, y: -8 },
  determined: { angle: -20, y: 4 },
  flat: { angle: 0, y: 6 },
};

export const Bee: React.FC<{
  size?: number;
  t: number;
  wingDamage?: number;
  mood?: Mood;
  look?: [number, number];
  flap?: "blur" | "slow" | "still";
  lid?: number;
  blink?: boolean;
  showTag?: boolean;
  style?: React.CSSProperties;
}> = ({ size = 300, t, wingDamage = 0, mood = "neutral", look = [0, 0], flap = "blur", lid = 0, blink = true, showTag = true, style }) => {
  // Kedip setiap ±3 dtk (deterministik).
  const blinkPhase = (t + 0.7) % 3.1;
  const blinkLid = blink && blinkPhase < 0.12 ? 1 : 0;
  const lidAmt = Math.max(lid, blinkLid);
  const frame = Math.round(t * 30);
  let wings: React.ReactNode;
  if (flap === "blur") {
    // ±200 kepakan/dtk tidak terlihat per frame → beberapa posisi transparan + jitter.
    const j = (frame % 3) * 6;
    wings = [-26 + j, 0, 24 - j].map((a, i) => (
      <React.Fragment key={i}>
        <Wing angle={a} damage={wingDamage} opacity={i === 1 ? 0.85 : 0.4} />
        <Wing angle={a} damage={wingDamage} opacity={i === 1 ? 0.85 : 0.4} mirror />
      </React.Fragment>
    ));
  } else {
    const a = flap === "slow" ? Math.sin(t * Math.PI * 2 * 3.2) * 26 : 0;
    wings = (
      <>
        <Wing angle={a} damage={wingDamage} />
        <Wing angle={a} damage={wingDamage} mirror />
      </>
    );
  }
  const brow = BROWS[mood];
  const px = look[0] * 6;
  const py = look[1] * 7;
  const eye = (side: -1 | 1) => (
    <g transform={`translate(${side * 24} -10)`}>
      <ellipse rx={17} ry={22} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
      <ellipse cx={px} cy={py + 2} rx={10.5} ry={14} fill={C.ink} />
      <circle cx={px + 4} cy={py - 4} r={4} fill={C.white} />
      {lidAmt > 0 ? (
        <>
          <clipPath id={`lid${side}`}>
            <ellipse rx={17} ry={22} />
          </clipPath>
          <rect x={-20} y={-24} width={40} height={46 * lidAmt} fill={C.honey} clipPath={`url(#lid${side})`} />
          <ellipse rx={17} ry={22} fill="none" stroke={C.ink} strokeWidth={3.5} />
        </>
      ) : null}
      <line
        x1={-14}
        x2={14}
        y1={0}
        y2={0}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinecap="round"
        transform={`translate(${side * 2} ${-34 + brow.y}) rotate(${side * brow.angle})`}
      />
    </g>
  );
  return (
    <svg viewBox="-110 -130 220 220" width={size} height={size} style={{ overflow: "visible", ...style }}>
      {/* antena */}
      <path d="M-14 -62 Q-22 -88 -34 -94 M14 -62 Q22 -88 34 -94" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={-35} cy={-95} r={7} fill={C.ink} />
      <circle cx={35} cy={-95} r={7} fill={C.ink} />
      {wings}
      {/* sengat */}
      <path d="M-8 64 L0 82 L8 64 Z" fill={C.ink} />
      {/* badan bulat + 2 garis */}
      <clipPath id="beeBody">
        <circle r={68} />
      </clipPath>
      <circle r={68} fill={C.honey} />
      <g clipPath="url(#beeBody)">
        <path d="M-80 22 Q0 36 80 22 L80 38 Q0 52 -80 38 Z" fill={C.ink} />
        <path d="M-80 48 Q0 62 80 48 L80 62 Q0 76 -80 62 Z" fill={C.ink} />
        <ellipse cx={-30} cy={-34} rx={20} ry={12} fill="rgba(255,255,255,0.35)" transform="rotate(-30 -30 -34)" />
      </g>
      <circle r={68} fill="none" stroke={C.ink} strokeWidth={5} />
      {eye(-1)}
      {eye(1)}
      {showTag ? (
        <g transform="translate(40 8) rotate(-14)">
          <rect x={-30} y={-11} width={60} height={22} rx={6} fill={C.white} stroke={C.ink} strokeWidth={2.5} />
          <text x={0} y={5} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={13} fill={C.ink}>
            {EPISODE.heroTag}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

// Lebah mini (tanpa ekspresi) untuk barisan / kerumunan.
export const TinyBee: React.FC<{ size: number; t: number; style?: React.CSSProperties; ghost?: boolean }> = ({ size, t, style, ghost }) => {
  const flapA = Math.round(t * 30) % 2 === 0 ? -14 : 10;
  return (
    <svg viewBox="-40 -48 80 80" width={size} height={size} style={{ overflow: "visible", ...style }}>
      <g opacity={ghost ? 0.5 : 1}>
        <ellipse cx={-14} cy={-24} rx={14} ry={10} fill="rgba(220,242,255,0.8)" stroke={C.ink} strokeWidth={3} transform={`rotate(${-30 + flapA} -4 -14)`} />
        <ellipse cx={14} cy={-24} rx={14} ry={10} fill="rgba(220,242,255,0.8)" stroke={C.ink} strokeWidth={3} transform={`rotate(${30 - flapA} 4 -14)`} />
        <circle r={24} fill={C.honey} stroke={C.ink} strokeWidth={4} />
        <path d="M-22 8 Q0 14 22 8 M-18 17 Q0 22 18 17" stroke={C.ink} strokeWidth={5} fill="none" />
        <circle cx={-8} cy={-6} r={4} fill={C.ink} />
        <circle cx={8} cy={-6} r={4} fill={C.ink} />
      </g>
    </svg>
  );
};
