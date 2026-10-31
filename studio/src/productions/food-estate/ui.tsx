import React from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "../../engine/animation/motion";
import { SAFE_AREA } from "../../config/video";
import { COLORS } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

// Teks layar produksi ini. Semuanya muncul dengan fade + geser kecil pada `at`,
// dan diletakkan di dalam area aman Instagram.

const useReveal = (at: number, until?: number) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16);
  const out = until === undefined ? 0 : progress(frame, until, 12);
  return { opacity: p * (1 - out), translate: `0 ${(1 - p) * 24}px` };
};

export const Kicker: React.FC<{
  at?: number;
  until?: number;
  children: React.ReactNode;
  color?: string;
}> = ({ at = 0, until, children, color = COLORS.accent }) => (
  <div
    style={{
      fontFamily: FONTS.mono,
      fontWeight: 600,
      fontSize: 36,
      letterSpacing: 6,
      color,
      ...useReveal(at, until),
    }}
  >
    {children}
  </div>
);

export const Headline: React.FC<{
  at?: number;
  until?: number;
  size?: number;
  children: React.ReactNode;
}> = ({ at = 0, until, size = 88, children }) => (
  <div
    style={{
      fontFamily: FONTS.serif,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.05,
      color: COLORS.white,
      textShadow: "0 4px 24px rgba(0,0,0,0.6)",
      ...useReveal(at, until),
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{
  at?: number;
  until?: number;
  children: React.ReactNode;
}> = ({ at = 0, until, children }) => (
  <div
    style={{
      fontFamily: FONTS.sans,
      fontWeight: 600,
      fontSize: 46,
      lineHeight: 1.3,
      color: COLORS.white,
      textShadow: "0 2px 16px rgba(0,0,0,0.7)",
      ...useReveal(at, until),
    }}
  >
    {children}
  </div>
);

// Atribusi sumber kecil di bawah area aman. Selalu tampil pada shot yang memuat klaim.
export const SourceTag: React.FC<{
  at?: number;
  children: React.ReactNode;
}> = ({ at = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_AREA.left,
      right: SAFE_AREA.right,
      bottom: SAFE_AREA.bottom - 70,
      fontFamily: FONTS.mono,
      fontSize: 28,
      color: COLORS.fog,
      textShadow: "0 1px 8px rgba(0,0,0,0.9)",
      ...useReveal(at),
    }}
  >
    {children}
  </div>
);

// Panel gelap di belakang teks, untuk citra terang (asap, awan).
const PANEL: React.CSSProperties = {
  background: "rgba(8,10,14,0.68)",
  padding: "22px 26px",
  marginLeft: -26,
  marginRight: -26,
};

// Kolom teks di bagian atas area aman.
export const TopBlock: React.FC<{
  children: React.ReactNode;
  gap?: number;
  panel?: boolean;
}> = ({ children, gap = 16, panel = false }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_AREA.left,
      right: SAFE_AREA.right,
      top: SAFE_AREA.top,
      display: "flex",
      flexDirection: "column",
      gap,
      ...(panel ? PANEL : {}),
    }}
  >
    {children}
  </div>
);

// Kolom teks di bagian bawah area aman.
export const BottomBlock: React.FC<{
  children: React.ReactNode;
  gap?: number;
  panel?: boolean;
}> = ({ children, gap = 14, panel = false }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_AREA.left,
      right: SAFE_AREA.right,
      bottom: SAFE_AREA.bottom,
      display: "flex",
      flexDirection: "column",
      gap,
      ...(panel ? PANEL : {}),
    }}
  >
    {children}
  </div>
);

// Gradasi gelap di atas/bawah agar teks terbaca di atas citra.
export const Scrim: React.FC<{ top?: number; bottom?: number }> = ({
  top = 0.55,
  bottom = 0.6,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(180deg, rgba(8,10,14,${top}) 0%, rgba(8,10,14,0) 32%, rgba(8,10,14,0) 62%, rgba(8,10,14,${bottom}) 100%)`,
    }}
  />
);
