import React from "react";
import { FONTS } from "../../../theme/fonts";
import { PAL } from "./palette";

// ---------------------------------------------------------------------------
// Visualisasi waktu.
//   SleepDial         — jam 24 jam: jarum berputar cepat (time-lapse), busur
//                       tidur terisi saat jarum melewatinya.
//   DayRing           — lingkaran 24 jam terbagi tidur/terjaga (12 → 16 jam).
//   TimelineVisualization — garis hidup 15 tahun, bagian tidur mengisi.
// Semua murni fungsi dari angka masukan → deterministik.
// ---------------------------------------------------------------------------

export const SLEEP = "#9FB2D0"; // tidur: biru senja lembut
export const SLEEP_DEEP = "#566477";
export const AWAKE = "#E9A15E"; // terjaga: oranye hangat

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  // sudut dalam "jam" 0..24, 0 di atas, searah jarum jam
  const p = (h: number) => {
    const a = (h / 24) * Math.PI * 2;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
  };
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 12 ? 1 : 0;
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
};

// Blok tidur dalam sehari (jam, mulai 06:00 → 30 = 06:00 esok).
// Pasti tidur = 12 jam; "bisa sampai" = +4 jam (total 16).
export const SLEEP_BLOCKS: { from: number; to: number; maybe?: boolean }[] = [
  { from: 9, to: 12 },
  { from: 12, to: 13.5, maybe: true },
  { from: 14, to: 17.5 },
  { from: 18.5, to: 20, maybe: true },
  { from: 21.5, to: 27 },
  { from: 27, to: 28, maybe: true },
];

export const SleepDial: React.FC<{ hours: number; size?: number; opacity?: number }> = ({ hours, size = 360, opacity = 1 }) => {
  const r = size / 2;
  const c = r + 10;
  const ring = r * 0.8;
  const hh = Math.floor(hours % 24);
  const mm = Math.floor((hours % 1) * 60);
  return (
    <svg width={size + 20} height={size + 20} style={{ opacity, overflow: "visible" }}>
      <defs>
        <radialGradient id="dialGlass" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#3A2E25" stopOpacity={0.55} />
          <stop offset="1" stopColor="#140E0A" stopOpacity={0.7} />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="url(#dialGlass)" stroke="#F3E7D3" strokeOpacity={0.35} strokeWidth={2} />
      <circle cx={c} cy={c} r={ring} fill="none" stroke="#F3E7D3" strokeOpacity={0.12} strokeWidth={22} />
      {SLEEP_BLOCKS.map((b, i) => {
        const end = Math.min(b.to, hours);
        if (end <= b.from) return null;
        return (
          <path
            key={i}
            d={arc(c, c, ring, b.from, end)}
            stroke={SLEEP}
            strokeOpacity={b.maybe ? 0.45 : 1}
            strokeDasharray={b.maybe ? "6 6" : undefined}
            strokeWidth={22}
            fill="none"
          />
        );
      })}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r0 = r * (i % 6 === 0 ? 0.9 : 0.94);
        return (
          <line
            key={i}
            x1={c + Math.sin(a) * r0}
            y1={c - Math.cos(a) * r0}
            x2={c + Math.sin(a) * r * 0.98}
            y2={c - Math.cos(a) * r * 0.98}
            stroke="#F3E7D3"
            strokeOpacity={i % 6 === 0 ? 0.8 : 0.35}
            strokeWidth={i % 6 === 0 ? 3 : 1.5}
          />
        );
      })}
      {[0, 6, 12, 18].map((h) => {
        const a = (h / 24) * Math.PI * 2;
        return (
          <text
            key={h}
            x={c + Math.sin(a) * r * 0.6}
            y={c - Math.cos(a) * r * 0.6 + 9}
            textAnchor="middle"
            fontFamily={FONTS.sans}
            fontWeight={600}
            fontSize={size * 0.065}
            fill="#F3E7D3"
            opacity={0.6}
          >
            {String(h).padStart(2, "0")}
          </text>
        );
      })}
      {/* jarum 24 jam */}
      <g transform={`rotate(${(hours / 24) * 360} ${c} ${c})`}>
        <line x1={c} y1={c + 14} x2={c} y2={c - ring - 16} stroke={PAL.sun} strokeWidth={4} strokeLinecap="round" />
        <circle cx={c} cy={c - ring - 16} r={6} fill={PAL.sun} />
      </g>
      <circle cx={c} cy={c} r={8} fill={PAL.sun} />
      <text x={c} y={c - r * 0.22} textAnchor="middle" fontFamily={FONTS.mono} fontSize={size * 0.075} fill="#F3E7D3" opacity={0.85}>
        {`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`}
      </text>
    </svg>
  );
};

// Lingkaran 24 jam: `sleepHours` diisi biru, sisanya oranye.
export const DayRing: React.FC<{ sleepHours: number; size?: number; highlight?: number }> = ({ sleepHours, size = 520, highlight = 0 }) => {
  const r = size / 2;
  const c = r + 20;
  const ring = r * 0.82;
  const w = r * 0.2;
  return (
    <svg width={size + 40} height={size + 40} style={{ overflow: "visible" }}>
      <circle cx={c} cy={c} r={ring} fill="none" stroke={AWAKE} strokeWidth={w} opacity={0.9} />
      {sleepHours > 0.01 ? (
        <path d={arc(c, c, ring, 0, Math.min(23.99, sleepHours))} fill="none" stroke={SLEEP} strokeWidth={w + highlight * 10} />
      ) : null}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={c + Math.sin(a) * (ring - w / 2)}
            y1={c - Math.cos(a) * (ring - w / 2)}
            x2={c + Math.sin(a) * (ring + w / 2)}
            y2={c - Math.cos(a) * (ring + w / 2)}
            stroke="#1E1712"
            strokeOpacity={0.35}
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
};

// Garis hidup 15 tahun: 15 balok tahun; porsi tidur mengisi dari kiri.
export const TimelineVisualization: React.FC<{
  years: number;
  sleepYears: number; // total tahun tidur yang diwarnai
  reveal: number; // 0..1 kemunculan balok
  width?: number;
}> = ({ years, sleepYears, reveal, width = 900 }) => {
  const gap = 8;
  const bw = (width - gap * (years - 1)) / years;
  const h = 120;
  return (
    <svg width={width} height={h + 70} style={{ overflow: "visible" }}>
      {Array.from({ length: years }, (_, i) => {
        const k = Math.min(1, Math.max(0, reveal * years - i));
        const fill = Math.min(1, Math.max(0, sleepYears - i));
        const x = i * (bw + gap);
        return (
          <g key={i} opacity={k} transform={`translate(0,${(1 - k) * 20})`}>
            <rect x={x} y={0} width={bw} height={h} rx={8} fill={AWAKE} />
            <rect x={x} y={0} width={bw * fill} height={h} rx={fill < 1 ? 0 : 8} fill={SLEEP} />
            {fill > 0 && fill < 1 ? <rect x={x + bw * fill - 2} y={0} width={4} height={h} fill="#FFFFFF" opacity={0.8} /> : null}
            {(i + 1) % 5 === 0 || i === 0 ? (
              <text x={x + bw / 2} y={h + 46} textAnchor="middle" fontFamily={FONTS.sans} fontWeight={600} fontSize={30} fill="#F3E7D3" opacity={0.75}>
                {i + 1}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
