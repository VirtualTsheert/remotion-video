import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBaloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { CARDS, EPISODE, HUD, dayAt, progressAt, wingAt, type CardSpec } from "./data";

export const C = {
  honey: "#F5A623",
  amber: "#C77700",
  cream: "#FFF4DC",
  ink: "#2B2118",
  leaf: "#6BBF59",
  sky: "#8FD3F4",
  dusk: "#3A2A1A",
  white: "#FFFFFF",
} as const;

export const F = {
  display: loadBaloo("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily,
  mono: loadSpaceMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily,
};

export const OUTLINE = 5;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.33, 0, 0.67, 1);
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// Waktu dalam detik relatif terhadap awal Sequence saat ini.
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const ramp = (t: number, a: number, b: number, ease = EASE) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: ease });

// Pop 90% → 100% dengan sedikit pantulan.
export const pop = (t: number, at: number, fps = 30) => {
  const p = spring({ frame: (t - at) * fps, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
  return { scale: 0.9 + 0.1 * p, opacity: Math.min(1, Math.max(0, (t - at) * 8)) };
};

// Angka "berputar" naik.
export const rollNumber = (t: number, from: number, to: number, start: number, dur: number) =>
  Math.round(interpolate(t, [start, start + dur], [from, to], { ...clamp, easing: EASE_OUT }));

// ---------- Ikon sebaris (tanpa emoji: headless Chrome di Codespace tidak punya font emoji) ----------
export const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 1 }) => {
  const s = { width: `${size}em`, height: `${size}em`, verticalAlign: "-0.12em", display: "inline-block" };
  if (name === "check")
    return (
      <svg viewBox="0 0 40 40" style={s}>
        <circle cx="20" cy="20" r="18" fill={C.leaf} stroke={C.ink} strokeWidth="3" />
        <path d="M11 21 L18 28 L30 13" fill="none" stroke={C.white} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "globe")
    return (
      <svg viewBox="0 0 40 40" style={s}>
        <circle cx="20" cy="20" r="17" fill={C.sky} stroke={C.ink} strokeWidth="3" />
        <path d="M9 14 q6 -6 11 0 q3 4 -2 7 q-4 3 -7 -1 z M23 24 q6 -3 9 2 q-2 6 -8 5 q-3 -3 -1 -7 z" fill={C.leaf} stroke={C.ink} strokeWidth="2" />
      </svg>
    );
  if (name === "honey")
    return (
      <svg viewBox="0 0 40 40" style={s}>
        <rect x="8" y="6" width="24" height="7" rx="3" fill={C.amber} stroke={C.ink} strokeWidth="3" />
        <path d="M9 14 h22 q3 0 3 4 v14 q0 4 -4 4 h-20 q-4 0 -4 -4 v-14 q0 -4 3 -4 z" fill={C.honey} stroke={C.ink} strokeWidth="3" />
        <path d="M14 22 l3 -2 l3 2 v4 l-3 2 l-3 -2 z" fill="none" stroke={C.amber} strokeWidth="2" />
      </svg>
    );
  if (name === "finger")
    return (
      <svg viewBox="0 0 40 40" style={s}>
        <path d="M16 6 q4 -2 4 3 v14 l8 1 q5 1 4 6 l-2 6 h-14 l-6 -9 q-1 -3 2 -3 l4 2 v-17 q0 -2 0 -3 z" fill="#FFD9A8" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  return null;
};

// Teks dengan *kata kunci* amber dan [ikon].
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*[^*]+\*|\[[a-z]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*"))
          return (
            <span key={i} style={{ color: C.amber }}>
              <RichText text={part.slice(1, -1)} />
            </span>
          );
        if (part.startsWith("[")) return <Icon key={i} name={part.slice(1, -1)} />;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

// ---------- Kartu teks (lapisan global, di atas semua adegan) ----------
const Card: React.FC<{ card: CardSpec; t: number }> = ({ card, t }) => {
  const p = pop(t, card.from);
  const out = ramp(t, card.to - 0.18, card.to);
  // Gerak halus agar kartu tidak pernah diam total.
  const drift = Math.sin(t * 1.3 + card.from) * 4;
  const big = card.big;
  const bigValue = big ? rollNumber(t, big.from ?? 0, big.value, card.from + 0.15, Math.min(1.2, card.to - card.from - 0.5)) : 0;
  const bigPop = big ? pop(t, card.from + 0.12) : null;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: card.small ? 1180 : 390,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: p.opacity * (1 - out),
        transform: `translateY(${drift - out * 20}px) scale(${p.scale})`,
      }}
    >
      <div
        style={{
          background: C.cream,
          border: `${OUTLINE}px solid ${C.ink}`,
          borderRadius: 36,
          boxShadow: `0 10px 0 ${C.ink}`,
          padding: card.small ? "18px 36px" : "26px 44px 30px",
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: card.small ? 52 : 70,
          lineHeight: 1.12,
          color: C.ink,
          textAlign: "center",
          maxWidth: 920,
        }}
      >
        {card.lines.map((line, i) => (
          <div key={i}>
            <RichText text={line} />
          </div>
        ))}
        {big && bigPop ? (
          <div
            style={{
              fontSize: big.value >= 100 ? 190 : 260,
              lineHeight: 0.95,
              color: C.amber,
              marginTop: 6,
              transform: `scale(${bigPop.scale})`,
              WebkitTextStroke: `4px ${C.ink}`,
              paintOrder: "stroke fill",
            }}
          >
            {big.prefix}
            {bigValue.toLocaleString("id-ID")}
            {big.suffix ? <span style={{ fontSize: 90, WebkitTextStroke: "0px" }}>{big.suffix}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const CardsLayer: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {CARDS.filter((c) => t >= c.from && t < c.to).map((c) => (
        <Card key={`${c.from}-${c.lines[0]}`} card={c} t={t} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- HUD game ----------
const Bar: React.FC<{ value: number; color: string; segments?: number; width: number }> = ({ value, color, segments = 10, width }) => (
  <div style={{ display: "flex", gap: 4, width }}>
    {Array.from({ length: segments }, (_, i) => {
      const fill = Math.min(1, Math.max(0, value * segments - i));
      return (
        <div key={i} style={{ flex: 1, height: 26, borderRadius: 5, background: "rgba(43,33,24,0.15)", overflow: "hidden", border: `2px solid ${C.ink}` }}>
          <div style={{ width: `${fill * 100}%`, height: "100%", background: color }} />
        </div>
      );
    })}
  </div>
);

export const HudLayer: React.FC = () => {
  const t = useT();
  if (t < HUD.bootAt || t > HUD.off.tag + 0.5) return null;
  const boot = ramp(t, HUD.bootAt, HUD.bootAt + 0.5);
  // Kedip "boot": beberapa frame pertama berkedip.
  const flicker = t < HUD.bootAt + 0.35 ? (Math.floor((t - HUD.bootAt) * 30) % 3 === 1 ? 0.3 : 1) : 1;
  const offFade = (at: number) => {
    const k = ramp(t, at, at + 0.25);
    const blink = t >= at && t < at + 0.25 && Math.floor((t - at) * 30) % 2 === 0 ? 0.4 : 1;
    return (1 - k) * blink;
  };
  const day = dayAt(t);
  const wing = wingAt(t);
  const prog = progressAt(t);
  const wingColor = wing > 0.5 ? C.leaf : wing > 0.25 ? C.honey : "#E0533D";
  const mono: React.CSSProperties = { fontFamily: F.mono, fontWeight: 700, color: C.ink, fontSize: 34, letterSpacing: 1 };
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 70,
        right: 70,
        opacity: boot * flicker,
        transform: `translateY(${(1 - boot) * -30}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(255,244,220,0.92)",
          border: `4px solid ${C.ink}`,
          borderRadius: 26,
          padding: "14px 24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: `0 6px 0 ${C.ink}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...mono, display: "flex", alignItems: "center", gap: 10, opacity: offFade(HUD.off.tag) }}>
            <MiniBee size={40} /> {EPISODE.heroTag}
          </div>
          <div style={{ ...mono, opacity: offFade(HUD.off.day) }}>
            HARI <span style={{ color: C.amber }}>{String(day).padStart(2, "0")}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: offFade(HUD.off.wing) }}>
            <WingIcon />
            <Bar value={wing} color={wingColor} segments={5} width={150} />
            <span style={{ ...mono, fontSize: 28, width: 82, textAlign: "right" }}>{Math.round(wing * 100)}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: offFade(HUD.off.mission), flex: 1, justifyContent: "flex-end" }}>
            <span style={{ ...mono, fontSize: 24 }}>MISI {EPISODE.mission}</span>
            <Bar value={prog} color={C.honey} segments={6} width={150} />
            <span style={{ ...mono, fontSize: 28, width: 82, textAlign: "right", color: prog >= 1 ? C.leaf : C.ink }}>{Math.floor(prog * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MiniBee: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="-24 -24 48 48" width={size} height={size}>
    <ellipse cx="-6" cy="-12" rx="9" ry="7" fill="rgba(255,255,255,0.85)" stroke={C.ink} strokeWidth="2.5" />
    <ellipse cx="7" cy="-12" rx="9" ry="7" fill="rgba(255,255,255,0.85)" stroke={C.ink} strokeWidth="2.5" />
    <circle r="15" fill={C.honey} stroke={C.ink} strokeWidth="3" />
    <path d="M-6 -14 v28 M5 -14 v28" stroke={C.ink} strokeWidth="5" />
    <circle cx="10" cy="-3" r="3" fill={C.ink} />
  </svg>
);

const WingIcon: React.FC = () => (
  <svg viewBox="0 0 40 30" width={46} height={34}>
    <path d="M4 26 Q2 6 20 3 Q36 2 36 12 Q34 22 4 26 z" fill="rgba(143,211,244,0.7)" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    <path d="M6 24 Q16 14 30 9" stroke={C.ink} strokeWidth="2" fill="none" opacity="0.5" />
  </svg>
);

// Kamera pelan: zoom/pan kontinu agar tidak ada frame diam.
export const Cam: React.FC<{
  scale?: [number, number];
  x?: [number, number];
  y?: [number, number];
  dur: number;
  origin?: string;
  children: React.ReactNode;
}> = ({ scale = [1, 1.05], x = [0, 0], y = [0, 0], dur, origin = "50% 55%", children }) => {
  const t = useT();
  const k = ramp(t, 0, dur);
  const s = scale[0] + (scale[1] - scale[0]) * k;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x[0] + (x[1] - x[0]) * k}px, ${y[0] + (y[1] - y[0]) * k}px) scale(${s})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
