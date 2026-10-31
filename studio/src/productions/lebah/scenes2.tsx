import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bee, TinyBee } from "./Bee";
import { CreamBg, Globe, HoneyDrop, Jar, Spoon, Sparkle } from "./props";
import { C, Cam, EASE, EASE_OUT, F, OUTLINE, clamp, pop, ramp, useT } from "./ui";
import { MissionPanel, SideFlower, SpoonShot } from "./scenes1";
import { SCALE, progressAt, wingAt } from "./data";
import { DRIP_PERIOD } from "./props";

// ---------------- 29,0–36,0 Menua ----------------
const SKY = ["#8FD3F4", "#F7A35C", "#1E2A4A", "#F6B48F", "#8FD3F4"];
const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(",")})`;
};
const skyAt = (cycle: number) => {
  const c = ((cycle % 1) + 1) % 1;
  const seg = c * 4;
  const i = Math.floor(seg);
  return mixHex(SKY[i], SKY[i + 1], seg - i);
};

export const Menua: React.FC = () => {
  const t = useT();
  const time = 29 + t;
  const cycle = t / 3.4; // ±2 hari dalam 7 dtk
  const damage = 1 - wingAt(time);
  const night = Math.max(0, Math.sin(((cycle % 1) - 0.25) * Math.PI * 2)) * (cycle % 1 > 0.3 && cycle % 1 < 0.8 ? 1 : 0);
  const sunA = (cycle % 1) * Math.PI * 2;
  const trips = Math.floor(damage * 10);
  const tripsAt = (n: number) => interpolate(n / 10, [0, 0.8], [29, 36]) - 29;
  return (
    <AbsoluteFill style={{ background: skyAt(cycle) }}>
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={(i * 211) % 1080} cy={620 + ((i * 137) % 700)} r={3 + (i % 3)} fill="#FFF7D6" opacity={night * (0.5 + 0.5 * Math.sin(t * 6 + i))} />
        ))}
        {/* matahari & bulan berputar */}
        <circle cx={540 + Math.cos(sunA - Math.PI / 2) * 620} cy={1500 + Math.sin(sunA - Math.PI / 2) * 620} r={90} fill="#FFE27A" stroke={C.ink} strokeWidth={OUTLINE} />
        <g transform={`translate(${540 + Math.cos(sunA + Math.PI / 2) * 620} ${1500 + Math.sin(sunA + Math.PI / 2) * 620})`}>
          <circle r={70} fill="#F4F1E1" stroke={C.ink} strokeWidth={OUTLINE} />
          <circle cx={26} cy={-14} r={60} fill={skyAt(cycle)} />
        </g>
        <path d="M-50 1500 Q300 1350 600 1460 T1150 1420 V1980 H-50 Z" fill={mixHex("#5A9E4B", "#1C2E28", night)} stroke={C.ink} strokeWidth={OUTLINE} />
        <path d="M-50 1640 Q380 1560 760 1650 T1150 1630 V1980 H-50 Z" fill={mixHex(C.leaf, "#243A2F", night)} stroke={C.ink} strokeWidth={OUTLINE} />
      </svg>
      <Cam dur={7} scale={[1, 1.1]} origin="50% 58%">
        <div style={{ position: "absolute", left: 330, top: 1000 + Math.sin(t * (damage > 0.4 ? 3 : 6)) * (14 + damage * 20), transform: `rotate(${damage * 8}deg)` }}>
          <Bee size={430} t={t} wingDamage={damage} mood={damage > 0.5 ? "worried" : "determined"} look={[0.6, 0.1]} flap={damage > 0.35 ? "slow" : "blur"} lid={damage * 0.35} />
        </div>
      </Cam>
      {/* penghitung perjalanan: tiap robekan = satu perjalanan */}
      {t > 3.4 ? (
        <div style={{ position: "absolute", left: 80, top: 1360, transform: `scale(${pop(t, 3.5).scale})`, background: C.cream, border: `${OUTLINE}px solid ${C.ink}`, borderRadius: 24, padding: "12px 24px", boxShadow: `0 6px 0 ${C.ink}`, fontFamily: F.mono, fontWeight: 700, fontSize: 40, color: C.ink }}>
          ROBEKAN <span style={{ color: C.amber }}>×{trips}</span>
          {trips > 0 ? <span style={{ display: "inline-block", marginLeft: 12, color: "#E0533D", transform: `scale(${pop(t, tripsAt(trips)).scale})` }}>+1</span> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 36,0–40,0 Selesai ----------------
export const Selesai: React.FC = () => {
  const t = useT();
  const time = 36 + t;
  const v = progressAt(time);
  const done = v >= 1;
  const glow = ramp(t, 2.6, 3.2);
  return (
    <AbsoluteFill>
      <CreamBg color="#F9DDB0" offset={t * 8} />
      <Cam dur={4} scale={[1, 1.08]} origin="50% 62%">
        <div style={{ position: "absolute", left: 130, top: 880, transform: `scale(${done ? pop(t, 2.5).scale : 1})` }}>
          <MissionPanel value={v} done={done} />
        </div>
        <div style={{ position: "absolute", left: 240, top: 1170 + Math.sin(t * 2) * 8 }}>
          <Bee size={420} t={t} wingDamage={1 - wingAt(time)} mood={done ? "happy" : "determined"} look={done ? [0.7, 0.5] : [0, -0.8]} flap="slow" lid={0.3} />
        </div>
        <HoneyDrop r={22} x={700} y={1430 + Math.sin(t * 2) * 8} glow={glow} opacity={ramp(t, 2.5, 2.9)} />
        {glow > 0 ? <Sparkle x={730} y={1385} size={60 * glow} t={t} /> : null}
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 40,0–43,5 Senja ----------------
const DuskBg: React.FC<{ t: number; fade: number }> = ({ t, fade }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${C.dusk} 0%, ${mixHex("#B5652E", C.dusk, fade)} 70%, ${mixHex("#E08A3E", C.dusk, fade * 0.8)} 100%)` }}>
    <svg width="1080" height="1920" style={{ position: "absolute" }}>
      <circle cx={760} cy={1500 + t * 30} r={140} fill={mixHex("#FFB45C", C.dusk, fade)} opacity={0.9} />
      <path d="M-50 1560 Q340 1460 700 1560 T1150 1540 V1980 H-50 Z" fill="#2A1E12" stroke={C.ink} strokeWidth={OUTLINE} />
    </svg>
  </AbsoluteFill>
);

const LANDED = { x: 330, y: 1010 };
export const DROP_ON_PETAL = { x: 640, y: 1335 };

export const Senja: React.FC = () => {
  const t = useT();
  const land = ramp(t, 0, 1.3, EASE_OUT);
  const fade = ramp(t, 0.2, 3.2);
  const landed = t > 1.3;
  return (
    <AbsoluteFill>
      <DuskBg t={t} fade={fade} />
      <AbsoluteFill style={{ filter: `saturate(${1 - fade * 0.65}) brightness(${1 - fade * 0.35})` }}>
        <Cam dur={3.5} scale={[1, 1.06]} origin="45% 62%">
          <SideFlower x={500} y={1400} scale={1.15} t={t * 0.3} color="#C97A9A" />
          <div style={{ position: "absolute", left: LANDED.x, top: interpolate(land, [0, 1], [760, LANDED.y]) }}>
            <Bee size={380} t={t} wingDamage={1} mood="sad" look={[0.2, 0.5]} flap={landed ? "still" : "slow"} lid={interpolate(t, [1.3, 3.3], [0.35, 0.85], clamp)} blink={false} />
          </div>
        </Cam>
      </AbsoluteFill>
      {/* tetes emas tetap hangat */}
      <Cam dur={3.5} scale={[1, 1.06]} origin="45% 62%">
        <HoneyDrop r={20} x={DROP_ON_PETAL.x} y={DROP_ON_PETAL.y} glow={0.6 + 0.2 * Math.sin(t * 3)} />
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 43,5–45,0 Perjalanan ----------------
export const Perjalanan: React.FC = () => {
  const t = useT();
  if (t < 0.75) {
    const rise = ramp(t, 0.05, 0.75, (x) => x * x);
    return (
      <AbsoluteFill>
        <DuskBg t={3.5 + t} fade={1} />
        <AbsoluteFill style={{ filter: "saturate(0.35) brightness(0.65)", transform: "scale(1.06)", transformOrigin: "45% 62%" }}>
          <SideFlower x={500} y={1400} scale={1.15} t={1} color="#C97A9A" />
          <div style={{ position: "absolute", left: LANDED.x, top: LANDED.y }}>
            <Bee size={380} t={0} wingDamage={1} mood="sad" look={[0, -0.6]} flap="still" lid={0.85} blink={false} />
          </div>
        </AbsoluteFill>
        <HoneyDrop r={20 + rise * 10} x={DROP_ON_PETAL.x + Math.sin(t * 8) * 20} y={interpolate(rise, [0, 1], [DROP_ON_PETAL.y + 30, -120])} glow={1} />
      </AbsoluteFill>
    );
  }
  const fall = ramp(t, 0.75, 1.35, (x) => x * x);
  return (
    <AbsoluteFill>
      <CreamBg offset={t * 10} />
      <AbsoluteFill style={{ transform: `scale(${1.04 + t * 0.02})`, transformOrigin: "50% 62%" }}>
        <Spoon fill={t > 1.35 ? 1 / 12 : 0} />
      </AbsoluteFill>
      {t < 1.35 ? <HoneyDrop r={26} x={540} y={interpolate(fall, [0, 1], [-100, 1170])} glow={1} /> : null}
    </AbsoluteFill>
  );
};

// ---------------- 45,0–52,0 Skala ----------------
const orbitPoints = (cx: number, cy: number, R: number, loops: number) => {
  const N = 360;
  const tilt = (-16 * Math.PI) / 180;
  return Array.from({ length: N + 1 }, (_, i) => {
    const u = i / N;
    const th = u * loops * Math.PI * 2 - Math.PI / 2;
    const ex = Math.cos(th) * R * 1.18;
    const ey = Math.sin(th) * R * 0.3 + (u - 0.5) * R * 0.9;
    return {
      x: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt),
      y: cy + ex * Math.sin(tilt) + ey * Math.cos(tilt),
      front: Math.sin(th) > 0,
    };
  });
};

export const Skala: React.FC = () => {
  const t = useT();
  const time = 45 + t;
  const landed = (i: number) => time >= SCALE.dropsStart + 0.1 + i * 0.12;
  const nLanded = Array.from({ length: 11 }, (_, i) => i).filter(landed).length;
  // fase kamera
  const toJar = ramp(time, SCALE.jarAt, SCALE.jarAt + 0.6, EASE_OUT);
  const toGlobe = ramp(time, SCALE.globeAt, SCALE.globeAt + 0.8, EASE_OUT);
  const wrap = ramp(time, SCALE.wrapAt, 51.7, EASE);
  const spoonScale = interpolate(toJar, [0, 1], [1, 0.32]) * (1 - toGlobe * 0.6);
  const jarScale = interpolate(toJar, [0, 1], [0.2, 1.1]) * interpolate(toGlobe, [0, 1], [1, 0.3]);
  const globeR = interpolate(toGlobe, [0, 1], [40, 300]);
  const globeY = interpolate(toGlobe, [0, 1], [2200, 1260]);
  const pts = orbitPoints(540, 1260, 300, SCALE.wraps);
  const shown = Math.floor(wrap * (pts.length - 1));
  const segs = (front: boolean) =>
    pts.slice(1, shown + 1).map((p, i) => (p.front === front ? <line key={i} x1={pts[i].x} y1={pts[i].y} x2={p.x} y2={p.y} /> : null));
  return (
    <AbsoluteFill>
      <CreamBg color={time > SCALE.globeAt ? mixHex(C.cream, "#FDE9C2", toGlobe) : C.cream} offset={t * 14} />
      {/* bola dunia + garis emas 2,5× */}
      {toGlobe > 0 ? (
        <>
          <svg width="1080" height="1920" style={{ position: "absolute" }}>
            <g stroke={C.amber} strokeWidth={12} strokeLinecap="round" opacity={0.35}>
              {segs(false)}
            </g>
          </svg>
          <Globe r={globeR} x={540} y={globeY} spin={t * 0.12} />
          <svg width="1080" height="1920" style={{ position: "absolute" }}>
            <g stroke={C.ink} strokeWidth={22} strokeLinecap="round">
              {segs(true)}
            </g>
            <g stroke={C.honey} strokeWidth={13} strokeLinecap="round">
              {segs(true)}
            </g>
            {shown > 0 ? <circle cx={pts[shown].x} cy={pts[shown].y} r={16} fill="#FFE27A" stroke={C.ink} strokeWidth={5} /> : null}
          </svg>
        </>
      ) : null}
      {/* toples */}
      {toJar > 0 ? <Jar fill={ramp(time, SCALE.jarAt + 0.2, SCALE.globeAt - 0.1, EASE)} x={540} y={interpolate(toGlobe, [0, 1], [1230, 870])} scale={jarScale} opacity={1 - ramp(time, SCALE.wrapAt, SCALE.wrapAt + 0.4)} /> : null}
      {/* sendok + 11 tetes */}
      <AbsoluteFill
        style={{
          transform: `translate(${toJar * -250}px, ${toJar * 230 - toGlobe * 600}px) scale(${spoonScale * (1.06 + t * 0.01)})`,
          transformOrigin: "50% 62%",
          opacity: 1 - toGlobe,
        }}
      >
        <Spoon fill={(1 + nLanded) / 12} />
        {Array.from({ length: 11 }, (_, i) => {
          const land = SCALE.dropsStart + 0.1 + i * 0.12;
          const k = ramp(time, land - 0.3, land, (x) => x * x);
          if (time < land - 0.3 || time >= land) return null;
          return <HoneyDrop key={i} r={22} x={440 + (i % 4) * 60} y={interpolate(k, [0, 1], [700, 1170])} />;
        })}
      </AbsoluteFill>
      {/* barisan 12 lebah = 1 sendok */}
      {toJar < 1 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 860, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, opacity: 1 - toJar }}>
          {Array.from({ length: 12 }, (_, i) => {
            const on = i === 0 || landed(i - 1);
            return (
              <div key={i} style={{ opacity: on ? 1 : 0.18, transform: `scale(${on ? pop(time, i === 0 ? 45 : SCALE.dropsStart + 0.1 + (i - 1) * 0.12).scale : 0.9})` }}>
                <TinyBee size={64} t={t + i * 0.05} ghost={!on} />
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- 52,0–55,0 Teh ----------------
export const Teh: React.FC = () => {
  const t = useT();
  const enter = ramp(t, 0, 0.5, EASE_OUT);
  const pour = ramp(t, 0.45, 0.6) * (1 - ramp(t, 0.95, 1.05));
  const stirring = t > 1.05;
  const stirA = (t - 1.05) * Math.PI * 2 * 2.5; // 2,5 putaran/dtk → denting tiap 0,2 dtk
  const dissolve = ramp(t, 1.1, 2.8);
  // posisi ujung sendok
  const tip = stirring
    ? { x: 540 + Math.cos(stirA) * 110, y: 1250 + Math.sin(stirA) * 26, rot: -30 + Math.cos(stirA) * 6 }
    : { x: interpolate(enter, [0, 1], [1000, 600]), y: interpolate(enter, [0, 1], [500, 930]), rot: interpolate(pour, [0, 1], [-20, 40]) };
  const secs = Math.min(3, Math.floor(t * (3 / 2.4)));
  return (
    <AbsoluteFill>
      <CreamBg offset={t * 10} />
      <Cam dur={3} scale={[1, 1.05]} origin="50% 60%">
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="tea">
              <path d="M330 1060 L750 1060 L715 1500 Q713 1530 683 1530 H397 Q367 1530 365 1500 Z" />
            </clipPath>
          </defs>
          {/* teh */}
          <g clipPath="url(#tea)">
            <rect x={300} y={1130} width={480} height={420} fill="#B5651D" />
            <rect x={300} y={1130} width={480} height={50} fill="#C9782C" />
            {/* pusaran madu yang larut */}
            <g opacity={pour > 0 || stirring ? 1 - dissolve : 0} transform={`translate(540 1300) rotate(${stirring ? stirA * 40 : 0})`}>
              <path d="M0 0 C40 -40 90 0 60 50 C20 110 -90 70 -90 0 C-90 -80 30 -120 100 -60" fill="none" stroke={C.honey} strokeWidth={22} strokeLinecap="round" />
            </g>
          </g>
          {/* gelas */}
          <path d="M330 1060 L750 1060 L715 1500 Q713 1530 683 1530 H397 Q367 1530 365 1500 Z" fill="rgba(220,240,255,0.25)" stroke={C.ink} strokeWidth={OUTLINE + 1} strokeLinejoin="round" />
          <ellipse cx={540} cy={1060} rx={210} ry={30} fill="rgba(255,255,255,0.4)" stroke={C.ink} strokeWidth={OUTLINE} />
          <path d="M360 1110 L392 1480" stroke="rgba(255,255,255,0.7)" strokeWidth={16} strokeLinecap="round" />
          {/* aliran madu saat menuang */}
          {pour > 0.05 ? <path d={`M${tip.x - 20} ${tip.y + 30} Q${tip.x - 30} ${tip.y + 120} 560 1150`} stroke={C.honey} strokeWidth={14 * pour} fill="none" strokeLinecap="round" /> : null}
          {/* sendok + tangan */}
          <g transform={`translate(${tip.x} ${tip.y}) rotate(${tip.rot})`}>
            <path d="M10 -20 L330 -300" stroke="#AEB7BF" strokeWidth={22} strokeLinecap="round" />
            <path d="M10 -20 L330 -300" stroke={C.ink} strokeWidth={30} strokeLinecap="round" opacity={0.0} />
            <ellipse cx={0} cy={0} rx={52} ry={34} fill="#C4CCD3" stroke={C.ink} strokeWidth={OUTLINE} transform="rotate(-40)" />
            {!stirring && pour < 0.9 ? <ellipse cx={0} cy={-2} rx={40} ry={24} fill={C.honey} transform="rotate(-40)" opacity={1 - pour} /> : null}
            <g transform="translate(300 -280) rotate(-40)">
              <rect x={10} y={-80} width={400} height={170} rx={40} fill="#4F7CC4" stroke={C.ink} strokeWidth={OUTLINE} />
              <path d="M-50 -40 Q-70 -60 -40 -70 L30 -70 Q60 -70 60 -40 V50 Q60 70 30 70 H-30 Q-60 70 -60 40 Z" fill="#FFD9A8" stroke={C.ink} strokeWidth={OUTLINE} />
              <path d="M-60 -10 Q-100 -20 -96 10 Q-90 30 -56 24" fill="#FFD9A8" stroke={C.ink} strokeWidth={OUTLINE} />
            </g>
          </g>
        </svg>
        {/* stopwatch */}
        <div style={{ position: "absolute", left: 120, top: 760, transform: `rotate(-6deg) scale(${pop(t, 0.2).scale * (secs === 3 ? 1 + 0.06 * Math.sin(t * 20) : 1)})`, opacity: pop(t, 0.2).opacity }}>
          <svg viewBox="-80 -100 160 180" width={190} height={214}>
            <rect x={-14} y={-98} width={28} height={20} rx={5} fill={C.ink} />
            <circle r={72} fill={C.cream} stroke={C.ink} strokeWidth={8} />
            <line x1={0} y1={0} x2={0} y2={-56} stroke="#E0533D" strokeWidth={7} strokeLinecap="round" transform={`rotate(${t * 120})`} />
            <circle r={8} fill={C.ink} />
          </svg>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 56, color: secs === 3 ? C.amber : C.ink, textAlign: "center", marginTop: -6 }}>00:0{secs}</div>
        </div>
      </Cam>
    </AbsoluteFill>
  );
};

// ---------------- 55,0–60,0 Penutup (kembali ke frame 1) ----------------
export const Penutup: React.FC = () => {
  const frame = useCurrentFrame();
  const last = 149;
  const k = interpolate(frame, [0, last], [1, 0], { ...clamp, easing: EASE });
  return <SpoonShot phase={frame - DRIP_PERIOD} zoom={1 + 0.14 * k} drift={(frame - DRIP_PERIOD) * 0.4} />;
};

