import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../../../theme/tokens";

// Transisi di dalam adegan (bukan template): setiap adegan mengatur sendiri
// masuk/keluarnya agar waktu global tetap sama persis dengan naskah VO.

// Memudar dari/ke warna (mis. hitam di awal film, biru senja di akhir).
export const Fade: React.FC<{ inFrames?: number; outFrames?: number; color?: string }> = ({
  inFrames = 0,
  outFrames = 0,
  color = "#0E0A07",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = inFrames > 0 ? interpolate(frame, [0, inFrames], [1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) }) : 0;
  const b =
    outFrames > 0
      ? interpolate(frame, [durationInFrames - outFrames, durationInFrames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) })
      : 0;
  const o = Math.max(a, b);
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o, pointerEvents: "none" }} />;
};

// Mekar cahaya hangat (light leak) yang menutupi potongan gambar di tengahnya.
export const LightBloom: React.FC<{ at: number; dur?: number; x?: number; strength?: number }> = ({
  at,
  dur = 24,
  x = 0.3,
  strength = 1,
}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at - dur / 2, at, at + dur / 2], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.sin) }) * strength;
  if (k <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(80% 60% at ${x * 100}% 35%, rgba(255,236,200,${k}), rgba(255,190,120,${k * 0.7}) 40%, rgba(255,160,90,${k * 0.25}) 75%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#FFF3E0", opacity: Math.max(0, k - 0.55) * 1.6 }} />
    </AbsoluteFill>
  );
};

// Topeng melingkar yang membuka (iris) — dipakai sekali untuk masuk ke grafik.
export const IrisMask: React.FC<{ start: number; dur: number; cx?: number; cy?: number; children: React.ReactNode; reverse?: boolean }> = ({
  start,
  dur,
  cx = 540,
  cy = 960,
  children,
  reverse,
}) => {
  const frame = useCurrentFrame();
  let p = interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  if (reverse) p = 1 - p;
  const r = p * 1300;
  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${r}px at ${cx}px ${cy}px)`,
        WebkitMaskImage: undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
