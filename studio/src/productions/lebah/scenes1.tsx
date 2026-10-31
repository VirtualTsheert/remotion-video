import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bee, TinyBee } from "./Bee";
import { CreamBg, Drip, Flower, HexCell, Spoon, hexPoints } from "./props";
import { C, Cam, EASE, EASE_OUT, F, OUTLINE, clamp, pop, ramp, useT } from "./ui";
import { GARDEN, gardenFlowers, gardenVisitTime } from "./data";

// ---------------- 0,0–1,6 Sendok ----------------
// Juga dipakai adegan Penutup: `phase` = frame siklus tetesan, `zoom` = skala kamera.
export const SpoonShot: React.FC<{ phase: number; zoom: number; drift: number }> = ({ phase, zoom, drift }) => (
  <AbsoluteFill>
    <CreamBg offset={drift} />
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 62%" }}>
      <Spoon />
      <Drip phase={phase} />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const Sendok: React.FC = () => {
  const frame = useCurrentFrame();
  return <SpoonShot phase={frame} zoom={1 + frame * 0.0016} drift={frame * 0.4} />;
};

// ---------------- 1,6–5,0 Tetes & Pilih ----------------
const DROP = { x: 540, y: 1300, r: 250 };
const tinyPos = (i: number) => {
  const row = Math.floor(i / 4);
  const col = i % 4;
  return { x: DROP.x - 165 + col * 110 + (row % 2) * 18, y: DROP.y - 60 + row * 105 };
};
const HERO_INDEX = 5;

const BigDrop: React.FC<{ r: number; x: number; y: number; opacity?: number }> = ({ r, x, y, opacity = 1 }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, opacity }}>
    <defs>
      <radialGradient id="dropGrad" cx="0.4" cy="0.6" r="0.7">
        <stop offset="0" stopColor="#FFDC8A" />
        <stop offset="0.6" stopColor={C.honey} />
        <stop offset="1" stopColor={C.amber} />
      </radialGradient>
    </defs>
    <g transform={`translate(${x} ${y}) scale(${r / 100})`}>
      <path d="M0 -150 C30 -90 100 -30 100 30 A100 100 0 1 1 -100 30 C-100 -30 -30 -90 0 -150 Z" fill="url(#dropGrad)" stroke={C.ink} strokeWidth={OUTLINE * (100 / r) * 1.2} />
      <ellipse cx={-48} cy={-6} rx={14} ry={30} fill="rgba(255,255,255,0.55)" transform="rotate(20 -48 -6)" />
    </g>
  </svg>
);

export const Tetes: React.FC = () => {
  const t = useT();
  const grow = ramp(t, 0, 0.4, EASE_OUT);
  const r = interpolate(grow, [0, 1], [30, DROP.r]);
  const x = interpolate(grow, [0, 1], [470, DROP.x]);
  const y = interpolate(grow, [0, 1], [1460, DROP.y]);
  return (
    <AbsoluteFill>
      <CreamBg offset={20 + t * 12} />
      <Cam dur={2} scale={[1, 1.05]}>
        <BigDrop r={r} x={x} y={y} />
        {Array.from({ length: 12 }, (_, i) => {
          const p = pop(t, 0.4 + i * 0.09);
          const pos = tinyPos(i);
          const bob = Math.sin(t * 6 + i) * 4;
          return (
            <div key={i} style={{ position: "absolute", left: pos.x - 45, top: pos.y - 45 + bob, opacity: p.opacity, transform: `scale(${p.scale})` }}>
              <TinyBee size={90} t={t + i * 0.03} />
            </div>
          );
        })}
      </Cam>
    </AbsoluteFill>
  );
};

export const Pilih: React.FC = () => {
  const t = useT();
  const pull = ramp(t, 0.05, 0.6, EASE_OUT);
  const others = 1 - ramp(t, 0.2, 0.7);
  const hero = tinyPos(HERO_INDEX);
  const heroP = pop(t, 0.55);
  return (
    <AbsoluteFill>
      <CreamBg offset={44 + t * 12} />
      <Cam dur={1.4} scale={[1.05, 1.1]}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${ramp(t, 0.2, 1.2) * 500}px)`, opacity: others }}>
          <BigDrop r={DROP.r} x={DROP.x} y={DROP.y} />
          {Array.from({ length: 12 }, (_, i) =>
            i === HERO_INDEX ? null : (
              <div key={i} style={{ position: "absolute", left: tinyPos(i).x - 45, top: tinyPos(i).y - 45 }}>
                <TinyBee size={90} t={t + i * 0.03} />
              </div>
            ),
          )}
        </div>
        {t < 0.55 ? (
          <div
            style={{
              position: "absolute",
              left: interpolate(pull, [0, 1], [hero.x, 540]) - 45,
              top: interpolate(pull, [0, 1], [hero.y, 1120]) - 45,
              transform: `scale(${1 + pull * 2.6})`,
            }}
          >
            <TinyBee size={90} t={t} />
          </div>
        ) : (
          <div style={{ position: "absolute", left: 540 - 230, top: 1120 - 260 + Math.sin(t * 4) * 10, transform: `scale(${heroP.scale})` }}>
            <Bee size={460} t={t} mood="happy" look={[0, 0.2]} />
          </div>
        )}
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 5,0–12,0 Sarang ----------------
const STATION_GAP = 900;
const camX = (t: number) =>
  -interpolate(t, [0, 1.5, 1.9, 3.3, 3.7, 5.0, 5.4, 7], [0, 0, 1, 1, 2, 2, 3, 3.08], { ...clamp, easing: EASE }) * STATION_GAP;

const Larva: React.FC = () => (
  <path d="M-30 -10 A32 30 0 1 0 22 -26 L12 -14 A18 16 0 1 1 -16 -6 Z" fill={C.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
);

const JobIcon: React.FC<{ kind: number }> = ({ kind }) => {
  // 0 sapu, 1 botol susu, 2 bata lilin, 3 perisai
  if (kind === 0)
    return (
      <g>
        <path d="M-6 -40 L6 -40 L4 6 L-4 6 Z" fill="#B07A3B" stroke={C.ink} strokeWidth={4} />
        <path d="M-22 6 H22 L28 40 H-28 Z" fill="#F7D774" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
    );
  if (kind === 1)
    return (
      <g>
        <path d="M-8 -40 h16 v8 h-16 z" fill="#F78FB3" stroke={C.ink} strokeWidth={4} />
        <rect x={-18} y={-32} width={36} height={66} rx={12} fill={C.white} stroke={C.ink} strokeWidth={4} />
        <rect x={-18} y={0} width={36} height={34} rx={10} fill="#FFE9B0" />
        <rect x={-18} y={-32} width={36} height={66} rx={12} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
    );
  if (kind === 2)
    return <polygon points={hexPoints(34)} fill="#FFE59A" stroke={C.ink} strokeWidth={5} />;
  return <path d="M0 -40 L32 -28 Q32 18 0 40 Q-32 18 -32 -28 Z" fill="#7FB3F5" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />;
};

export const Sarang: React.FC = () => {
  const t = useT();
  const cx = camX(t);
  const moving = Math.abs(camX(t + 0.05) - cx) > 3;
  const cards = [0.1, 1.8, 3.6, 5.3];
  return (
    <AbsoluteFill style={{ background: "#F7C25C" }}>
      {/* sarang latar (parallax lebih lambat) */}
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        <defs>
          <pattern id="comb" width="208" height="360" patternUnits="userSpaceOnUse" patternTransform={`translate(${cx * 0.55} 0)`}>
            <rect width="208" height="360" fill="#E8A53A" />
            {[
              [104, 60],
              [0, 240],
              [208, 240],
              [0, -120],
              [208, -120],
              [104, 420],
            ].map(([x, y], i) => (
              <polygon key={i} points={hexPoints(110, x, y)} fill={i % 2 ? "#F5B94A" : "#F3AE38"} stroke={C.amber} strokeWidth="10" />
            ))}
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#comb)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,244,220,0.35), rgba(120,60,0,0.35) 85%)" }} />
      <Cam dur={7} scale={[1, 1.06]}>
        {/* stasiun pekerjaan */}
        <svg width="1080" height="1920" style={{ position: "absolute", overflow: "visible" }}>
          <g transform={`translate(${cx} 0)`}>
            {/* 0 bersihkan sel */}
            <HexCell x={720} y={1230} r={170} fill={C.cream} />
            {/* 1 asuh larva */}
            <HexCell x={720 + STATION_GAP} y={1230} r={170} fill="#FFF0C9">
              <Larva />
            </HexCell>
            {/* 2 bangun sarang: sel digambar */}
            <g transform={`translate(${720 + STATION_GAP * 2} 1230)`}>
              {[
                [-150, 0],
                [0, 0],
                [150, 0],
              ].map(([x], i) => {
                const k = ramp(t, 3.5 + i * 0.45, 4.1 + i * 0.45);
                return (
                  <polygon
                    key={i}
                    points={hexPoints(86, x, i === 1 ? -150 : 0)}
                    fill={`rgba(255,229,154,${k})`}
                    stroke={C.amber}
                    strokeWidth={14}
                    strokeDasharray={600}
                    strokeDashoffset={600 * (1 - k)}
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>
            {/* 3 pintu sarang */}
            <g transform={`translate(${720 + STATION_GAP * 3} 1230)`}>
              <ellipse rx={180} ry={120} fill="#5A3208" stroke={C.ink} strokeWidth={OUTLINE * 1.5} />
              <ellipse rx={150} ry={95} fill="#FFF7D6" />
              <ellipse rx={150} ry={95} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={30} opacity={0.5 + 0.3 * Math.sin(t * 4)} />
            </g>
            {/* kilau sel bersih */}
            {[0, 1, 2].map((i) => {
              const s = 0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i * 2));
              return (
                <path
                  key={i}
                  transform={`translate(${650 + i * 70} ${1150 + (i % 2) * 120}) scale(${s * 2})`}
                  d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z"
                  fill={C.white}
                />
              );
            })}
            {/* hati kecil di atas larva */}
            <path
              transform={`translate(${720 + STATION_GAP + 60} ${1110 - ((t * 60) % 60)}) scale(1.6)`}
              d="M0 6 C-14 -4 -8 -16 0 -9 C8 -16 14 -4 0 6 Z"
              fill="#F2547D"
              stroke={C.ink}
              strokeWidth={2.5}
              opacity={1 - ((t * 1) % 1)}
            />
            {/* lencana ikon pekerjaan */}
            {cards.map((at, i) => {
              const p = pop(t, at + 0.15);
              return (
                <g key={i} transform={`translate(${720 + STATION_GAP * i + 150} ${990}) scale(${p.scale * 1.5})`} opacity={p.opacity}>
                  <circle r={52} fill={C.cream} stroke={C.ink} strokeWidth={5} />
                  <JobIcon kind={i} />
                </g>
              );
            })}
          </g>
        </svg>
        {/* lebah tetap di kiri, kamera menggeser dunia */}
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 1150 + Math.sin(t * 5) * (moving ? 6 : 14),
            transform: `rotate(${moving ? 8 : Math.sin(t * 3) * 4}deg)`,
          }}
        >
          <Bee size={380} t={t} mood={t > 5.3 ? "determined" : "happy"} look={[0.8, 0.1]} flap={moving ? "blur" : "still"} />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 12,0–14,0 Macet ----------------
export const MissionPanel: React.FC<{ value: number; shake?: number; alert?: number; done?: boolean; width?: number }> = ({ value, shake = 0, alert = 0, done, width = 820 }) => (
  <div
    style={{
      width,
      background: C.cream,
      border: `${OUTLINE + 1}px solid ${alert > 0 ? "#E0533D" : C.ink}`,
      borderRadius: 34,
      boxShadow: `0 10px 0 ${C.ink}`,
      padding: "26px 34px 30px",
      transform: `translateX(${shake}px)`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontWeight: 700, fontSize: width < 500 ? 30 : 38, color: C.ink }}>
      <span>{width < 500 ? "MISI" : "MISI: 1/12 sdt"}</span>
      <span style={{ color: done ? C.leaf : alert > 0 ? "#E0533D" : C.amber }}>{Math.floor(value * 100)}%</span>
    </div>
    <div style={{ marginTop: 18, height: 64, borderRadius: 20, border: `${OUTLINE}px solid ${C.ink}`, background: "rgba(43,33,24,0.1)", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(value * 100, value > 0 ? 2.5 : 0)}%`,
          height: "100%",
          background: done ? C.leaf : `repeating-linear-gradient(-45deg, ${C.honey} 0 24px, #FFC85A 24px 48px)`,
          borderRight: value > 0 && value < 1 ? `4px solid ${C.ink}` : undefined,
        }}
      />
    </div>
  </div>
);

export const Macet: React.FC = () => {
  const t = useT();
  const err = t > 0.5 && t < 0.95;
  const shake = err ? Math.sin(t * 90) * 14 * (1 - ramp(t, 0.5, 0.95)) : 0;
  const p = pop(t, 0.05);
  return (
    <AbsoluteFill>
      <CreamBg color="#FBE7BE" offset={t * 10} />
      <Cam dur={2} scale={[1, 1.07]} origin="50% 60%">
        <div style={{ position: "absolute", left: 130, top: 900, transform: `scale(${p.scale})`, opacity: p.opacity }}>
          <MissionPanel value={0} shake={shake} alert={err ? 1 : 0} />
        </div>
        {err ? (
          <div style={{ position: "absolute", left: 860, top: 820, fontFamily: F.display, fontWeight: 800, fontSize: 120, color: "#E0533D", WebkitTextStroke: `4px ${C.ink}`, transform: `rotate(12deg) scale(${pop(t, 0.5).scale})` }}>
            !
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 260, top: 1180 + Math.sin(t * 2) * 6 }}>
          <Bee size={420} t={t} mood={t > 0.6 ? "sad" : "flat"} look={[0.3, -0.9]} flap="still" lid={t > 0.6 ? 0.25 : 0} />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 14,0–17,0 Keluar ----------------
const Hills: React.FC<{ t: number }> = ({ t }) => (
  <svg width="1080" height="1920" style={{ position: "absolute" }}>
    <circle cx={820} cy={720} r={110} fill="#FFE27A" stroke={C.ink} strokeWidth={OUTLINE} />
    {[0, 1].map((i) => {
      const x = ((i * 600 + t * 40) % 1500) - 300;
      return (
        <g key={i} transform={`translate(${x} ${880 + i * 140})`}>
          <ellipse cx={0} cy={0} rx={120} ry={52} fill={C.white} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={70} cy={-28} rx={80} ry={50} fill={C.white} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={30} cy={6} rx={130} ry={44} fill={C.white} />
        </g>
      );
    })}
    <path d="M-50 1380 Q300 1180 620 1330 T1150 1290 V1980 H-50 Z" fill="#8CD07A" stroke={C.ink} strokeWidth={OUTLINE} />
    <path d="M-50 1560 Q360 1420 760 1540 T1150 1520 V1980 H-50 Z" fill={C.leaf} stroke={C.ink} strokeWidth={OUTLINE} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 80 + i * 120;
      const y = 1600 + (i % 3) * 70;
      return (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y + 90} stroke="#3E8E3A" strokeWidth={8} />
          <Flower x={x} y={y} size={0.9} hue={i} rot={t * 10 + i * 20} />
        </g>
      );
    })}
  </svg>
);

export const Keluar: React.FC = () => {
  const t = useT();
  const inside = t < 1.15;
  const zoomIn = interpolate(t, [0, 1.15], [1, 5], { ...clamp, easing: (x) => x * x * x });
  const flash = interpolate(t, [0.85, 1.15, 1.7], [0, 1, 0], clamp);
  const fly = ramp(t, 1.2, 2.6, EASE_OUT);
  return (
    <AbsoluteFill>
      {inside ? (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 48%, #8A5410, #3A2208 75%)" }}>
          <AbsoluteFill style={{ transform: `scale(${zoomIn})`, transformOrigin: "50% 48%" }}>
            <svg width="1080" height="1920" style={{ position: "absolute" }}>
              <ellipse cx={540} cy={920} rx={260} ry={170} fill="#FFFBEA" stroke={C.ink} strokeWidth={OUTLINE * 1.5} />
              <ellipse cx={540} cy={920} rx={330} ry={230} fill="none" stroke="rgba(255,240,190,0.35)" strokeWidth={60} />
            </svg>
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: interpolate(t, [0, 1.1], [300, 470]),
              top: interpolate(t, [0, 1.1], [1350, 900]),
              transform: `scale(${interpolate(t, [0, 1.1], [1, 0.35], clamp)})`,
              transformOrigin: "50% 50%",
            }}
          >
            <Bee size={400} t={t} mood="determined" look={[0.3, -0.6]} />
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: `linear-gradient(${C.sky}, #CDEFFC 70%)` }}>
          <Cam dur={1.8} scale={[1.08, 1]}>
            <Hills t={t} />
            <div
              style={{
                position: "absolute",
                left: interpolate(fly, [0, 1], [-200, 330]),
                top: interpolate(fly, [0, 1], [1200, 1000]) + Math.sin(t * 6) * 12,
                transform: `rotate(${(1 - fly) * 15}deg)`,
              }}
            >
              <Bee size={400} t={t} mood="happy" look={[0.5, -0.2]} />
            </div>
          </Cam>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
    </AbsoluteFill>
  );
};

// ---------------- 17,0–26,0 Taman (peta top-down) ----------------
const FLOWERS = gardenFlowers();
const HIVE = { x: 1500, y: 2100 };
const FOCUS = { x: 540, y: 1150 };

const beeAt = (time: number) => {
  // Titik i dikunjungi pada gardenVisitTime(i); sebelum bunga pertama, dari sarang.
  let prevT = 17.0;
  let prev = HIVE;
  for (let i = 0; i < FLOWERS.length; i++) {
    const vt = gardenVisitTime(i);
    if (time <= vt) {
      const u = (time - prevT) / (vt - prevT);
      const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      return { x: prev.x + (FLOWERS[i].x - prev.x) * e, y: prev.y + (FLOWERS[i].y - prev.y) * e, visited: i, heading: Math.atan2(FLOWERS[i].y - prev.y, FLOWERS[i].x - prev.x) };
    }
    prevT = vt;
    prev = FLOWERS[i];
  }
  return { ...prev, visited: FLOWERS.length, heading: 0 };
};

const Speedo: React.FC<{ t: number }> = ({ t }) => {
  const v = 25 + Math.sin(t * 7) * 1.5;
  const ang = -120 + (v / 40) * 240;
  return (
    <svg viewBox="-110 -110 220 160" width={260} height={190}>
      <path d="M-90 30 A95 95 0 1 1 90 30" fill={C.cream} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = ((-120 + i * 30) * Math.PI) / 180 - Math.PI / 2;
        return <line key={i} x1={Math.cos(a) * 70} y1={Math.sin(a) * 70} x2={Math.cos(a) * 84} y2={Math.sin(a) * 84} stroke={C.ink} strokeWidth={5} />;
      })}
      <line x1={0} y1={0} x2={0} y2={-70} stroke="#E0533D" strokeWidth={9} strokeLinecap="round" transform={`rotate(${ang})`} />
      <circle r={12} fill={C.ink} />
      <text y={42} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={30} fill={C.ink}>
        {v.toFixed(0)} km/j
      </text>
    </svg>
  );
};

const WingBeat: React.FC<{ t: number }> = ({ t }) => {
  const pts = Array.from({ length: 60 }, (_, i) => `${i * 4},${40 + Math.sin(i * 1.3 + t * 40) * 30}`).join(" ");
  return (
    <div style={{ background: C.cream, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 24, padding: "10px 18px", width: 300 }}>
      <svg width={240} height={80}>
        <polyline points={pts} fill="none" stroke={C.amber} strokeWidth={5} />
      </svg>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.ink }}>
        ≈{Math.round(196 + Math.sin(t * 9) * 4)}×/dtk
      </div>
    </div>
  );
};

export const Taman: React.FC = () => {
  const local = useT();
  const time = 17 + local;
  const bee = beeAt(time);
  const zoom = interpolate(time, [17, 22.8, 25.9], [1.0, 0.82, 0.3], { ...clamp, easing: EASE });
  const k = ramp(time, 22.8, 25.9);
  const center = { x: bee.x + (HIVE.x - bee.x) * k, y: bee.y + (HIVE.y + 150 - bee.y) * k };
  const count = Math.min(GARDEN.final, bee.visited);
  const trail = [HIVE, ...FLOWERS.slice(0, bee.visited), bee];
  const inv = 1 / zoom;
  return (
    <AbsoluteFill style={{ background: "#5DAE4C" }}>
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${zoom}) translate(${-center.x} ${-center.y})`}>
          <rect x={-1000} y={-1000} width={5000} height={6400} fill={C.leaf} />
          {/* petak rumput & semak */}
          {Array.from({ length: 70 }, (_, i) => {
            const x = ((i * 397) % 3400) - 200;
            const y = ((i * 613) % 4600) - 200;
            return i % 3 === 0 ? (
              <circle key={i} cx={x} cy={y} r={70 + (i % 5) * 14} fill="#4E9E45" stroke={C.ink} strokeWidth={5} />
            ) : (
              <ellipse key={i} cx={x} cy={y} rx={160} ry={90} fill="#7BC968" />
            );
          })}
          <path d="M-200 900 Q900 1300 1500 2000 T3200 3300" fill="none" stroke="#E9D3A0" strokeWidth={90} strokeLinecap="round" />
          <ellipse cx={2350} cy={1400} rx={260} ry={170} fill={C.sky} stroke={C.ink} strokeWidth={6} />
          {/* sarang */}
          <g transform={`translate(${HIVE.x} ${HIVE.y})`}>
            <rect x={-70} y={-60} width={140} height={120} rx={14} fill="#E3A84A" stroke={C.ink} strokeWidth={6} />
            <rect x={-70} y={-60} width={140} height={34} rx={10} fill={C.amber} stroke={C.ink} strokeWidth={6} />
            <circle cy={20} r={14} fill={C.ink} />
          </g>
          {FLOWERS.map((f, i) => {
            const vt = gardenVisitTime(i);
            const v = time >= vt ? Math.min(1, (time - vt) * 3) : 0;
            return <Flower key={i} x={f.x} y={f.y} size={f.size} hue={f.hue} visited={v} rot={i * 23} />;
          })}
          {/* jejak terbang putus-putus */}
          <polyline
            points={trail.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none"
            stroke={C.ink}
            strokeWidth={6 * Math.sqrt(inv)}
            strokeDasharray={`${18 * Math.sqrt(inv)} ${16 * Math.sqrt(inv)}`}
            strokeLinecap="round"
            opacity={0.75}
          />
          {/* +1 */}
          {FLOWERS.map((f, i) => {
            const dt = time - gardenVisitTime(i);
            if (dt < 0 || dt > 0.7) return null;
            return (
              <text
                key={i}
                x={f.x}
                y={f.y - 50 * inv - dt * 120 * inv}
                textAnchor="middle"
                fontFamily={F.display}
                fontWeight={800}
                fontSize={64 * inv * (i < 20 ? 1 : 0.8)}
                fill={C.honey}
                stroke={C.ink}
                strokeWidth={6 * inv}
                paintOrder="stroke"
                opacity={1 - dt / 0.7}
              >
                +1
              </text>
            );
          })}
        </g>
      </svg>
      {/* lebah di layar (ukuran tetap terbaca saat kamera menjauh) */}
      {(() => {
        const sx = FOCUS.x + (bee.x - center.x) * zoom;
        const sy = FOCUS.y + (bee.y - center.y) * zoom;
        const size = 240 * Math.max(0.55, zoom);
        return (
          <div style={{ position: "absolute", left: sx - size / 2, top: sy - size * 0.6, transform: `rotate(${Math.cos(bee.heading) * 12}deg)` }}>
            <Bee size={size} t={local} mood="happy" look={[Math.cos(bee.heading), Math.sin(bee.heading)]} showTag={zoom > 0.7} />
          </div>
        );
      })()}
      {/* widget: penghitung bunga, speedometer, kepakan */}
      <div style={{ position: "absolute", left: 80, top: 1330, display: "flex", gap: 24, alignItems: "flex-end" }}>
        <div style={{ background: C.cream, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 24, padding: "12px 22px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 6px 0 ${C.ink}` }}>
          <svg viewBox="-50 -50 100 100" width={64} height={64}>
            <Flower x={0} y={0} size={1} hue={0} />
          </svg>
          <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 52, color: C.ink, minWidth: 70 }}>×{count}</span>
        </div>
        {local < 3.0 ? (
          <div style={{ transform: `scale(${pop(local, 0.15).scale})` }}>
            <Speedo t={local} />
          </div>
        ) : local < 6.0 ? (
          <div style={{ transform: `scale(${pop(local, 3.05).scale})` }}>
            <WingBeat t={local} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 26,0–29,0 Sabar ----------------
export const SideFlower: React.FC<{ x: number; y: number; scale?: number; color?: string; t: number }> = ({ x, y, scale = 1, color = "#F78FB3", t }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(t * 1.5) * 2})`}>
      <path d="M0 0 Q-20 300 10 900" stroke="#3E8E3A" strokeWidth={22} fill="none" />
      <path d="M-4 260 Q-140 200 -170 280 Q-80 320 -4 280 Z" fill={C.leaf} stroke={C.ink} strokeWidth={OUTLINE} />
      {[-150, -95, -40, 15, 70, 125].map((a, i) => (
        <ellipse key={i} cx={0} cy={-90} rx={46} ry={110} fill={color} stroke={C.ink} strokeWidth={OUTLINE} transform={`rotate(${a * 0.55} 0 0)`} />
      ))}
      <ellipse cx={0} cy={-10} rx={150} ry={46} fill="#FFD84D" stroke={C.ink} strokeWidth={OUTLINE} />
    </g>
  </svg>
);

export const Sabar: React.FC = () => {
  const t = useT();
  const turn = ramp(t, 0.7, 1.1);
  const prog = pop(t, 0.1);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.sky}, #D8F2FC 60%, #A8DD95)` }}>
      <Cam dur={3} scale={[1, 1.12]} origin="45% 62%">
        <SideFlower x={500} y={1400} scale={1.15} t={t} />
        <div style={{ position: "absolute", left: 330, top: 1000 + Math.sin(t * 1.6) * 3 }}>
          <Bee size={380} t={t} mood={turn > 0.5 ? "flat" : "neutral"} look={[0.8 * (1 - turn), 0.4 * (1 - turn)]} flap="still" lid={turn > 0.5 ? 0.3 : 0} />
        </div>
        <div style={{ position: "absolute", left: 680, top: 860, transform: `scale(${prog.scale}) rotate(4deg)`, opacity: prog.opacity }}>
          <MissionPanel value={0.03} width={300} />
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

