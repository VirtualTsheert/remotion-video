import React, { useMemo } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { progress } from "../animation/motion";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

// Stabilo yang disapukan di belakang teks.
export const Highlight: React.FC<{
  start: number;
  duration?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ start, duration = 14, color = COLORS.highlight, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration, EASE.inOut);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: -6,
          right: -6,
          top: "18%",
          bottom: "8%",
          background: color,
          opacity: 0.75,
          mixBlendMode: "multiply",
          transformOrigin: "0 50%",
          scale: `${p} 1`,
          borderRadius: 4,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// Bar sensor hitam yang menutup teks.
export const Redact: React.FC<{ start: number; duration?: number; children: React.ReactNode }> = ({
  start,
  duration = 10,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration, EASE.inOut);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span style={{ position: "absolute", inset: "4% -4px", background: "#0a0a0a", transformOrigin: "0 50%", scale: `${p} 1` }} />
    </span>
  );
};

// Lingkaran tangan (spidol merah) yang digambar mengelilingi area w×h.
// Bentuknya sedikit tidak rata dan saling tumpang di ujung, seperti tangan manusia.
export const CircleMark: React.FC<{
  width: number;
  height: number;
  start: number;
  duration?: number;
  color?: string;
  seed?: string;
  stroke?: number;
}> = ({ width, height, start, duration = 20, color = COLORS.accent, seed = "c", stroke = 7 }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => {
    const pts: string[] = [];
    const turns = 1.12;
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const a = -Math.PI * 0.6 + (i / steps) * turns * Math.PI * 2;
      const wobble = 1 + (random(`${seed}${i % 9}`) - 0.5) * 0.06 + (i / steps) * 0.05;
      const x = width / 2 + Math.cos(a) * (width / 2) * wobble;
      const y = height / 2 + Math.sin(a) * (height / 2) * wobble;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [width, height, seed]);
  const p = progress(frame, start, duration, EASE.inOut);
  const pad = stroke * 2 + width * 0.05;
  return (
    <svg
      width={width + pad * 2}
      height={height + pad * 2}
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible", pointerEvents: "none" }}
    >
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} opacity={0.9} />
    </svg>
  );
};

// Stempel tinta yang "dihantamkan": membesar → mengecil cepat.
export const Stamp: React.FC<{
  text: string;
  at: number;
  color?: string;
  rotate?: number;
  size?: number;
}> = ({ text, at, color = COLORS.accent, rotate = -12, size = 64 }) => {
  const frame = useCurrentFrame();
  const hit = interpolate(frame, [at, at + 6], [0, 1], { ...clamp, easing: EASE.cinematic });
  if (frame < at) return null;
  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 28px",
        border: `6px double ${color}`,
        color,
        fontFamily: FONTS.typewriter,
        fontSize: size,
        letterSpacing: 6,
        rotate: `${rotate}deg`,
        scale: interpolate(hit, [0, 1], [2.2, 1]),
        opacity: interpolate(hit, [0, 0.3, 1], [0, 0.9, 0.85]),
        mixBlendMode: "multiply",
      }}
    >
      {text}
    </div>
  );
};

// Teks yang diketik huruf demi huruf, dengan kursor berkedip.
export const Typewriter: React.FC<{
  text: string;
  start: number;
  charsPerSecond?: number;
  caret?: boolean;
}> = ({ text, start, charsPerSecond = 22, caret = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.max(0, Math.floor(((frame - start) / fps) * charsPerSecond));
  const done = count >= text.length;
  const showCaret = caret && frame >= start && (!done || Math.floor(frame / 15) % 2 === 0);
  return (
    <span>
      {text.slice(0, count)}
      <span style={{ opacity: showCaret ? 1 : 0 }}>▌</span>
    </span>
  );
};
