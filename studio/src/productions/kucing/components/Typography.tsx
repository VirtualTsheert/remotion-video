import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../../../theme/fonts";
import { clamp } from "../../../theme/tokens";
import { VO } from "../data/script";

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// Teks muncul per kata: naik sedikit, dari blur ke tajam. Keluar memudar.
export const AnimatedTypography: React.FC<{
  text: string;
  start: number; // frame lokal
  end?: number;
  y: number; // posisi vertikal (px layar)
  size?: number;
  font?: "serif" | "sans";
  weight?: number;
  color?: string;
  tracking?: number;
  stagger?: number;
  italic?: boolean;
}> = ({ text, start, end, y, size = 64, font = "sans", weight = 800, color = "#F8F1E4", tracking = 0.06, stagger = 4, italic }) => {
  const frame = useCurrentFrame();
  const out = end === undefined ? 1 : interpolate(frame, [end - 15, end], [1, 0], clamp);
  if (frame < start || out <= 0) return null;
  const words = text.split(" ");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: font === "serif" ? FONTS.serif : FONTS.sans,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          fontSize: size,
          lineHeight: 1.15,
          letterSpacing: `${tracking}em`,
          color,
          opacity: out,
          textShadow: "0 4px 30px rgba(20,12,6,0.55), 0 2px 6px rgba(20,12,6,0.35)",
          fontVariantNumeric: "lining-nums",
        }}
      >
        {words.map((w, i) => {
          const p = interpolate(frame, [start + i * stagger, start + i * stagger + 22], [0, 1], { ...clamp, easing: EASE_OUT });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: p,
                transform: `translateY(${(1 - p) * 26}px)`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Angka berformat Indonesia (koma desimal).
export const formatId = (v: number, decimals: number) =>
  v.toFixed(decimals).replace(".", ",");

// Penghitung angka: dari `from` ke `to` selama `dur` frame.
export const useCounter = (from: number, to: number, start: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [from, to], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
};

// Teks terjemahan VO (subtitle). Waktu diambil dari script.ts.
// `offset` = detik global awal adegan/komposisi tempat komponen ini berada.
export const Captions: React.FC<{ offset?: number; bottom?: number }> = ({ offset = 0, bottom = 470 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + offset;
  const line = VO.find((l) => t >= l.from - 0.1 && t <= l.to + 0.35);
  if (!line) return null;
  const o = interpolate(t, [line.from - 0.1, line.from + 0.2, line.to + 0.05, line.to + 0.35], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          bottom,
          textAlign: "center",
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.35,
          color: "#FBF4E8",
          opacity: o,
          transform: `translateY(${(1 - o) * 8}px)`,
          textShadow: "0 2px 4px rgba(15,9,5,0.8), 0 0 24px rgba(15,9,5,0.55)",
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};
