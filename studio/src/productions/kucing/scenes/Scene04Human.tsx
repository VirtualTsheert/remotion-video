import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { CatCharacter } from "../components/CatCharacter";
import { poseTrack } from "../components/CatAnimation";
import { AWAKE, SLEEP } from "../components/Timeline";
import { rand } from "../components/geom";
import { FONTS } from "../../../theme/fonts";
import { clamp } from "../../../theme/tokens";
import { CUES, HUMAN } from "../data/script";
import { at } from "../data/scenes";

// SCENE 4 — DIBANDINGKAN MANUSIA (53,5–79 dtk)
// Satu kotak = satu tahun. Satu baris (15 kotak) = seluruh hidup kucing;
// hidup manusia 75 tahun = 5 baris. Kotak manusia terisi berurutan:
// tidur → main HP → kerja → sisanya; lalu "makan, macet, rebahan" ikut
// memotong sisa waktu. Kucing berbaring di atas barisnya sendiri.
const S = "S4-Manusia" as const;
const DUR = 765;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

const COLORS: Record<string, string> = { sleep: SLEEP, phone: "#7FB8B0", work: "#C99B6B", rest: AWAKE };
const START: Record<string, number> = {
  sleep: at(S, CUES.humanSleep),
  phone: at(S, CUES.humanPhone),
  work: at(S, CUES.humanWork),
  rest: at(S, CUES.humanRest),
};
const FILL_DUR: Record<string, number> = { sleep: 55, phone: 40, work: 28, rest: 45 };

const COLS = 15;
const GAP = 8;
const W = 900;
const B = (W - GAP * (COLS - 1)) / COLS;
const GRID_TOP = 840;
const CAT_ROW = 700;

// ikon garis sederhana 44px
const Icon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => (
  <svg width={44} height={44} viewBox="0 0 44 44" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    {kind === "sleep" ? <path d="M30 8a14 14 0 1 0 6 22A12 12 0 0 1 30 8z" fill={color} fillOpacity={0.25} /> : null}
    {kind === "phone" ? (
      <>
        <rect x={12} y={4} width={20} height={36} rx={4} fill={color} fillOpacity={0.25} />
        <path d="M19 34h6" />
      </>
    ) : null}
    {kind === "work" ? (
      <>
        <rect x={5} y={14} width={34} height={24} rx={4} fill={color} fillOpacity={0.25} />
        <path d="M16 14V9h12v5M5 24h34" />
      </>
    ) : null}
    {kind === "rest" ? (
      <>
        <circle cx={22} cy={22} r={8} fill={color} fillOpacity={0.35} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <path key={i} d={`M${22 + Math.cos(a) * 13} ${22 + Math.sin(a) * 13}L${22 + Math.cos(a) * 18} ${22 + Math.sin(a) * 18}`} />;
        })}
      </>
    ) : null}
  </svg>
);

export const Scene04Human: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const humanIn = interpolate(frame, [at(S, CUES.human), at(S, CUES.human) + 25], [0, 1], { ...clamp, easing: OUT });
  const catRowIn = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: OUT });

  // Kotak ke-i milik kategori apa & sudah terisi berapa (0..1).
  const cells: { color: string; fill: number }[] = [];
  for (const p of HUMAN.parts) {
    const n = Math.round(p.years);
    for (let k = 0; k < n; k++) {
      const s0 = START[p.key] + (k / n) * FILL_DUR[p.key];
      cells.push({ color: COLORS[p.key], fill: interpolate(frame, [s0, s0 + 8], [0, 1], clamp) });
    }
  }
  // "makan, macet, rebahan": kotak-kotak sisa yang ikut terpotong (ilustratif, tanpa angka).
  const cut = at(S, CUES.humanCut);
  const restStart = cells.length - Math.round(HUMAN.parts[3].years);
  const cutGroups = [
    { label: "makan", cells: [restStart + 2, restStart + 3, restStart + 4], at: cut },
    { label: "macet", cells: [restStart + 9, restStart + 10, restStart + 11], at: cut + 22 },
    { label: "rebahan", cells: [restStart + 17, restStart + 18, restStart + 19, restStart + 20], at: cut + 44 },
  ];
  const cutK = (i: number) => {
    const g = cutGroups.find((x) => x.cells.includes(i));
    return g ? interpolate(frame, [g.at, g.at + 10], [0, 1], clamp) : 0;
  };

  // Judul aktif: kategori terakhir yang sudah dimulai.
  const active = [...HUMAN.parts].reverse().find((p) => frame >= START[p.key]);
  const activeStart = active ? START[active.key] : 0;
  const count = active ? interpolate(frame, [activeStart, activeStart + FILL_DUR[active.key]], [0, active.years], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const headK = interpolate(frame, [activeStart, activeStart + 14], [0, 1], { ...clamp, easing: OUT });
  const restPulse = frame > START.rest + FILL_DUR.rest ? 0.5 + 0.5 * Math.sin(t * 4) : 0;

  const catPose = poseTrack(
    [
      { frame: 0, pose: "loaf", set: { eye: 0 } },
      { frame: START.phone, pose: "loaf", set: { eye: 0 } },
      { frame: START.phone + 20, pose: "loaf", set: { eye: 1, headR: -2, lookX: -0.6, lookY: 0.4 } },
      { frame: START.rest + 40, pose: "loaf", set: { eye: 1, headR: -6, lookX: -0.6, lookY: 0.5 } },
      { frame: cut + 44, pose: "loaf", set: { eye: 0.6, ear: -6 } },
      { frame: cut + 70, pose: "curl" },
      { frame: DUR, pose: "curl" },
    ],
    frame,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#141A26" }}>
      <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 45%, #2A3348 0%, #182030 55%, #0E121B 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {Array.from({ length: 22 }, (_, i) => {
          const depth = 0.3 + rand(i + 31) * 0.9;
          const x = rand(i + 37) * 1280 - 100 + noise2D(`hb${i}`, t * 0.05, 0) * 40 - t * depth * 6;
          const y = rand(i + 43) * 2000 + noise2D(`hc${i}`, 0, t * 0.05) * 40;
          return <circle key={i} cx={x} cy={y} r={20 + depth * 70} fill={i % 3 ? "#9FB2D0" : "#F8D89A"} opacity={0.05 + depth * 0.05} style={{ filter: `blur(${4 + depth * 8}px)` }} />;
        })}
      </svg>

      {/* Judul */}
      {frame < START.sleep ? (
        <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", opacity: humanIn, transform: `translateY(${(1 - humanIn) * 24}px)` }}>
          <div style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: 40, letterSpacing: "0.3em", color: "#F3E7D3", opacity: 0.85 }}>KALAU MANUSIA?</div>
          <div style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 140, color: "#F8F1E4", lineHeight: 1.1, fontVariantNumeric: "lining-nums" }}>
            {HUMAN.life} TAHUN
          </div>
        </div>
      ) : active ? (
        <div key={active.key} style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", opacity: headK, transform: `translateY(${(1 - headK) * 24}px)` }}>
          <div style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 150, color: COLORS[active.key], lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums", textShadow: "0 6px 40px rgba(0,0,0,0.45)" }}>
            {active.key === "rest" ? "" : "±"}
            {Math.round(count)} TAHUN
          </div>
          <div style={{ marginTop: 18, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 42, letterSpacing: "0.3em", color: "#F3E7D3" }}>
            {active.key === "rest" ? "SISANYA" : `UNTUK ${active.label}`}
          </div>
        </div>
      ) : null}

      {/* Baris kucing = 15 tahun */}
      <div style={{ position: "absolute", left: 90, top: CAT_ROW, opacity: catRowIn }}>
        <svg width={W} height={B + 10} style={{ overflow: "visible" }}>
          {Array.from({ length: 15 }, (_, i) => (
            <rect key={i} x={i * (B + GAP)} y={0} width={B} height={B} rx={8} fill={i < 10 ? SLEEP : AWAKE} />
          ))}
          <g>
            <CatCharacter id="s4cat" pose={catPose} x={W - 110} y={-2} scale={0.42} seed={6} light={{ rim: 0.5, tint: [0.92, 0.94, 1] }} />
          </g>
        </svg>
        <div style={{ position: "absolute", top: -48, left: 0, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 28, letterSpacing: "0.2em", color: "#F3E7D3", opacity: 0.8 }}>
          KUCING · 15 TAHUN
        </div>
      </div>

      {/* Grid manusia = 75 tahun */}
      <div style={{ position: "absolute", left: 90, top: GRID_TOP, opacity: humanIn }}>
        <div style={{ position: "absolute", top: -48, left: 0, fontFamily: FONTS.sans, fontWeight: 700, fontSize: 28, letterSpacing: "0.2em", color: "#F3E7D3", opacity: 0.8 }}>
          MANUSIA · {HUMAN.life} TAHUN
        </div>
        <svg width={W} height={5 * (B + GAP)} style={{ overflow: "visible" }}>
          {Array.from({ length: HUMAN.life }, (_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const appear = interpolate(frame, [at(S, CUES.human) + i * 0.35, at(S, CUES.human) + i * 0.35 + 10], [0, 1], clamp);
            const cell = cells[i];
            const ck = cutK(i);
            const isRest = cell.color === AWAKE;
            const x = col * (B + GAP);
            const y = row * (B + GAP);
            return (
              <g key={i} opacity={appear} transform={`translate(${x + B / 2},${y + B / 2}) scale(${0.7 + 0.3 * appear}) translate(${-B / 2},${-B / 2})`}>
                <rect width={B} height={B} rx={8} fill="none" stroke="#F3E7D3" strokeOpacity={0.25} strokeWidth={2} />
                <rect
                  x={(B / 2) * (1 - cell.fill)}
                  y={(B / 2) * (1 - cell.fill)}
                  width={B * cell.fill}
                  height={B * cell.fill}
                  rx={8}
                  fill={ck > 0 ? "#5B6170" : cell.color}
                  opacity={isRest && ck === 0 ? 0.85 + 0.15 * restPulse : 1}
                />
                {ck > 0 ? <path d={`M10,${B - 10} L${B - 10},10`} stroke="#2A2F3A" strokeWidth={4} opacity={ck} /> : null}
              </g>
            );
          })}
        </svg>
        {/* label potongan sisa waktu */}
        {cutGroups.map((g) => {
          const k = interpolate(frame, [g.at, g.at + 12], [0, 1], { ...clamp, easing: OUT });
          const i0 = g.cells[0];
          const x = (i0 % COLS) * (B + GAP);
          const y = Math.floor(i0 / COLS) * (B + GAP);
          return k > 0 ? (
            <div
              key={g.label}
              style={{
                position: "absolute",
                left: x - 10,
                top: y - 46 + (1 - k) * 10,
                padding: "4px 14px",
                borderRadius: 20,
                background: "#F3E7D3",
                color: "#38291F",
                fontFamily: FONTS.sans,
                fontWeight: 700,
                fontSize: 26,
                opacity: k,
                whiteSpace: "nowrap",
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              }}
            >
              {g.label}
            </div>
          ) : null;
        })}
      </div>

      {/* Legenda */}
      <div style={{ position: "absolute", top: GRID_TOP + 5 * (B + GAP) + 40, left: 120, right: 120, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 22, columnGap: 30 }}>
        {HUMAN.parts.map((p) => {
          const k = interpolate(frame, [START[p.key], START[p.key] + 15], [0, 1], { ...clamp, easing: OUT });
          return (
            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 14, opacity: k, transform: `translateX(${(1 - k) * -16}px)` }}>
              <Icon kind={p.key} color={COLORS[p.key]} />
              <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 30, color: "#F3E7D3", letterSpacing: "0.06em" }}>
                {p.label} <span style={{ color: COLORS[p.key] }}>{p.key === "rest" ? "" : "±"}{Math.round(p.years)} thn</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1335, width: "100%", textAlign: "center", fontFamily: FONTS.sans, fontSize: 22, color: "#F3E7D3", opacity: 0.45 * humanIn }}>
        estimasi kasar · sumber: BPS 2025, data.ai 2024
      </div>
    </AbsoluteFill>
  );
};
