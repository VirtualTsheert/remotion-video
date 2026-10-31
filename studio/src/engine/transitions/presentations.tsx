import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { clamp } from "../../theme/tokens";

// Transisi sinematik murni CSS — pengganti presentasi shader bawaan yang
// memperlambat render 10–40× di WebGL CPU. Adegan yang MASUK dirender di atas.

type NoProps = Record<string, never>;
type P = TransitionPresentationComponentProps<NoProps>;

// Celup ke hitam: adegan lama gelap total, lalu adegan baru muncul.
// Untuk jeda waktu yang jelas atau pergantian bab.
const Dip: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) => (
  <AbsoluteFill
    style={{
      opacity:
        presentationDirection === "exiting"
          ? interpolate(p, [0, 0.5], [1, 0], clamp)
          : interpolate(p, [0.5, 1], [0, 1], clamp),
    }}
  >
    {children}
  </AbsoluteFill>
);

// Kilau cahaya hangat seperti ujung rol film terbakar cahaya.
// Untuk melompat ke materi arsip / masa lalu.
const LightLeak: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ filter: `brightness(${1 + p * 1.4}) sepia(${p * 0.6})` }}>{children}</AbsoluteFill>
    );
  }
  const flash = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: interpolate(p, [0.35, 0.7], [0, 1], clamp) }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: flash,
          mixBlendMode: "screen",
          background: `radial-gradient(ellipse 90% 60% at ${20 + p * 60}% ${30 + p * 30}%, rgba(255,214,150,1) 0%, rgba(255,120,40,0.8) 35%, rgba(120,20,0,0) 75%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Dorong masuk: adegan lama membesar cepat seakan kamera menembusnya,
// adegan baru mendarat dari sedikit lebih besar. Untuk "masuk lebih dalam" ke detail.
const PushIn: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) =>
  presentationDirection === "exiting" ? (
    // Adegan lama hilang sebelum adegan baru muncul agar teks tidak bertumpuk.
    <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1, 2.6]), opacity: interpolate(p, [0.15, 0.45], [1, 0], clamp) }}>
      {children}
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ scale: interpolate(p, [0, 1], [1.35, 1]), opacity: interpolate(p, [0.45, 0.85], [0, 1], clamp) }}>
      {children}
    </AbsoluteFill>
  );

const make = (component: React.FC<P>): TransitionPresentation<NoProps> => ({ component, props: {} as NoProps });

export const dip = () => make(Dip);
export const lightLeak = () => make(LightLeak);
export const pushIn = () => make(PushIn);
