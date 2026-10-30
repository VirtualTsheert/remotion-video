import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

// ====== TEKS PENUTUP (bebas diubah) ======
const CTA_TEXT = "Cek sunscreen-nya di keranjang kuning";
// =========================================

const C = {
  cream: "#FFF4E3",
  mint: "#E6F5F2",
  orange: "#FF7A30",
  yellow: "#FFB020",
  dark: "#2A1E16",
  soft: "#6B5A4D",
  teal: "#1F9E8F",
  red: "#E5484D",
  white: "#FFFFFF",
};

// Durasi tiap scene (30 frame = 1 detik)
const D = { hook: 150, uv: 240, bahaya: 240, solusi: 270, cta: 150 };
export const TOTAL_DURATION = D.hook + D.uv + D.bahaya + D.solusi + D.cta;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const shadow = "0 12px 40px rgba(42,30,22,0.10)";

// Animasi muncul: fade + naik sedikit
const appear = (frame: number, start: number): React.CSSProperties => ({
  opacity: interpolate(frame, [start, start + 15], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [start, start + 20], [40, 0], { ...clamp, easing: ease })}px`,
});

const Scene: React.FC<{
  dur: number;
  bg: string;
  noFade?: boolean;
  children: React.ReactNode;
}> = ({ dur, bg, noFade, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill
        style={{
          fontFamily,
          color: C.dark,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 90px 260px",
          gap: 40,
          opacity: noFade ? 1 : interpolate(frame, [dur - 12, dur], [1, 0], clamp),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Sun: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: size, height: size, rotate: `${frame * 0.6}deg` }}>
      {new Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: size / 2 - 8,
            top: 0,
            width: 16,
            height: size,
            rotate: `${i * 30}deg`,
          }}
        >
          <div style={{ width: 16, height: size * 0.17, borderRadius: 8, background: C.yellow }} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          inset: size * 0.22,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #FFE7A0, #FF9F40)",
          boxShadow: "0 0 60px rgba(255,176,32,0.6)",
        }}
      />
    </div>
  );
};

// ===== SCENE 1: HOOK =====
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({ frame: frame - 50, fps, config: { damping: 11 } });
  return (
    <Scene dur={D.hook} bg={C.cream}>
      <div style={{ ...appear(frame, 0), fontSize: 64, fontWeight: 600, color: C.soft }}>
        Lagi mendung,
      </div>
      <div style={{ ...appear(frame, 10), fontSize: 92, fontWeight: 800, lineHeight: 1.1 }}>
        jadi nggak perlu sunscreen?
      </div>
      <div
        style={{
          opacity: Math.min(1, stamp * 2),
          scale: String(interpolate(stamp, [0, 1], [1.8, 1])),
          rotate: "-4deg",
          padding: "14px 48px",
          border: `8px solid ${C.red}`,
          borderRadius: 24,
          color: C.red,
          fontSize: 96,
          fontWeight: 800,
        }}
      >
        SALAH!
      </div>
      <div style={{ ...appear(frame, 85), fontSize: 50, fontWeight: 600, color: C.soft, lineHeight: 1.35 }}>
        Sinar UV tetap tembus awan,
        <br />
        walau langit nggak terik.
      </div>
    </Scene>
  );
};

// ===== SCENE 2: KENALAN SINAR UV =====
const UvCard: React.FC<{
  frame: number;
  start: number;
  tag: string;
  title: string;
  desc: string;
  color: string;
}> = ({ frame, start, tag, title, desc, color }) => (
  <div
    style={{
      ...appear(frame, start),
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 36,
      background: C.white,
      borderRadius: 36,
      padding: "36px 44px",
      textAlign: "left",
      boxShadow: shadow,
    }}
  >
    <div style={{ fontSize: 76, fontWeight: 800, color }}>{tag}</div>
    <div>
      <div style={{ fontSize: 46, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 36, color: C.soft, lineHeight: 1.35, marginTop: 6 }}>{desc}</div>
    </div>
  </div>
);

const SinarUV: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene dur={D.uv} bg={C.cream}>
      <div style={appear(frame, 0)}>
        <Sun size={240} />
      </div>
      <div style={{ ...appear(frame, 8), fontSize: 72, fontWeight: 800, lineHeight: 1.15 }}>
        Kenalan dulu
        <br />
        sama sinar UV
      </div>
      <UvCard
        frame={frame}
        start={45}
        tag="UVA"
        title="A = Aging"
        desc="Bikin flek, kusam & keriput. Bisa tembus kaca & awan."
        color={C.orange}
      />
      <UvCard
        frame={frame}
        start={95}
        tag="UVB"
        title="B = Burning"
        desc="Bikin kulit merah, perih & terbakar."
        color={C.red}
      />
      <div style={{ ...appear(frame, 150), fontSize: 42, fontWeight: 600, color: C.soft }}>
        Dua-duanya ada setiap hari.
      </div>
    </Scene>
  );
};

// ===== SCENE 3: BAHAYA =====
const bahaya = [
  "Kulit belang & kusam",
  "Muncul flek hitam",
  "Keriput datang lebih cepat",
  "Risiko kanker kulit naik",
];

const Bahaya: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene dur={D.bahaya} bg={C.cream}>
      <div style={{ ...appear(frame, 0), fontSize: 72, fontWeight: 800, lineHeight: 1.15 }}>
        Kalau dibiarkan,
        <br />
        kulitmu bisa...
      </div>
      {bahaya.map((text, i) => {
        const last = i === bahaya.length - 1;
        return (
          <div
            key={text}
            style={{
              ...appear(frame, 35 + i * 30),
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 32,
              background: last ? C.red : C.white,
              color: last ? C.white : C.dark,
              borderRadius: 32,
              padding: "30px 40px",
              fontSize: 46,
              fontWeight: 600,
              textAlign: "left",
              boxShadow: shadow,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: "50%",
                background: last ? C.white : C.orange,
                color: last ? C.red : C.white,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              {i + 1}
            </div>
            {text}
          </div>
        );
      })}
    </Scene>
  );
};

// ===== SCENE 4: SOLUSI =====
const Shield: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  return (
    <svg width={200} height={240} viewBox="0 0 100 120" style={{ scale: String(pop) }}>
      <path d="M50 4 L92 20 V58 C92 86 72 106 50 116 C28 106 8 86 8 58 V20 Z" fill={C.teal} />
      <path
        d="M30 60 L45 75 L72 45"
        stroke={C.white}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={70}
        strokeDashoffset={interpolate(frame, [25, 45], [70, 0], clamp)}
      />
    </svg>
  );
};

const tips = [
  "Pilih SPF 30+ & PA+++",
  "Pakai 2 ruas jari untuk wajah & leher",
  "Ulangi tiap 2 jam, apalagi saat berkeringat",
];

const Solusi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene dur={D.solusi} bg={C.mint}>
      <div style={{ ...appear(frame, 0), fontSize: 60, fontWeight: 600, color: C.soft }}>
        Solusinya simpel:
      </div>
      <Shield frame={frame} />
      <div style={{ ...appear(frame, 20), fontSize: 100, fontWeight: 800, color: C.teal, letterSpacing: 2 }}>
        SUNSCREEN
      </div>
      <div style={{ ...appear(frame, 30), fontSize: 44, fontWeight: 600, marginTop: -24 }}>
        tameng kulitmu setiap hari
      </div>
      {tips.map((text, i) => (
        <div
          key={text}
          style={{
            ...appear(frame, 90 + i * 35),
            width: "100%",
            background: C.white,
            borderLeft: `14px solid ${C.teal}`,
            borderRadius: 28,
            padding: "28px 40px",
            fontSize: 40,
            fontWeight: 600,
            textAlign: "left",
            boxShadow: shadow,
          }}
        >
          {text}
        </div>
      ))}
    </Scene>
  );
};

// ===== SCENE 5: PENUTUP =====
const Penutup: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene dur={D.cta} bg={C.orange} noFade>
      <div style={appear(frame, 0)}>
        <Sun size={200} />
      </div>
      <div style={{ ...appear(frame, 8), fontSize: 76, fontWeight: 800, color: C.white, lineHeight: 1.15 }}>
        Kulit sehat itu
        <br />
        investasi jangka panjang.
      </div>
      <div style={{ ...appear(frame, 30), fontSize: 48, fontWeight: 600, color: C.white }}>
        Mulai dari hari ini, ya.
      </div>
      <div style={{ ...appear(frame, 60), marginTop: 20 }}>
        <div
          style={{
            scale: String(1 + 0.04 * Math.sin(frame / 6)),
            background: C.white,
            color: C.dark,
            fontSize: 42,
            fontWeight: 800,
            padding: "28px 52px",
            borderRadius: 999,
          }}
        >
          {CTA_TEXT}
        </div>
      </div>
    </Scene>
  );
};

// ===== SUSUNAN VIDEO =====
export const MyComposition: React.FC = () => {
  const s2 = D.hook;
  const s3 = s2 + D.uv;
  const s4 = s3 + D.bahaya;
  const s5 = s4 + D.solusi;
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream }}>
      <Sequence name="1. Hook" from={0} durationInFrames={D.hook}>
        <Hook />
      </Sequence>
      <Sequence name="2. Sinar UV" from={s2} durationInFrames={D.uv}>
        <SinarUV />
      </Sequence>
      <Sequence name="3. Bahaya" from={s3} durationInFrames={D.bahaya}>
        <Bahaya />
      </Sequence>
      <Sequence name="4. Solusi" from={s4} durationInFrames={D.solusi}>
        <Solusi />
      </Sequence>
      <Sequence name="5. Penutup" from={s5} durationInFrames={D.cta}>
        <Penutup />
      </Sequence>
    </AbsoluteFill>
  );
};