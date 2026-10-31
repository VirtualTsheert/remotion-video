import React from "react";
import { AbsoluteFill, getRemotionEnvironment, useCurrentFrame } from "remotion";
import { SAFE_AREA } from "../../config/video";

// Lapisan akhir sinematik: grain film (seed berganti per frame, deterministik)
// dan vignette. Dipasang di atas setiap shot agar seluruh video terasa satu "stok film".
export const Finish: React.FC<{ grain?: number; vignette?: number }> = ({
  grain = 0.08,
  vignette = 0.55,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      {grain > 0 ? (
        <svg width="100%" height="100%" style={{ position: "absolute", opacity: grain, mixBlendMode: "overlay" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 97} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

// Garis bantu area aman. Hanya tampil di Studio, tidak pernah ikut ter-render.
export const SafeAreaGuide: React.FC = () => {
  if (!getRemotionEnvironment().isStudio) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top,
          bottom: SAFE_AREA.bottom,
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          outline: "2px dashed rgba(0,255,200,0.35)",
        }}
      />
    </AbsoluteFill>
  );
};
