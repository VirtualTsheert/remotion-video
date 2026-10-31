import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { SAFE_AREA, isDebug } from "../../config/video";

const GRAIN_TILES = 4;

// Lapisan akhir sinematik: grain film dan vignette. Dipasang di atas setiap shot
// agar seluruh video terasa satu "stok film".
// Grain memakai gambar noise yang dibuat sekali (scripts/build-textures.sh), diganti
// tiap 2 frame dengan offset deterministik — jauh lebih murah daripada noise SVG.
export const Finish: React.FC<{ grain?: number; vignette?: number }> = ({
  grain = 0.12,
  vignette = 0.55,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const tile = step % GRAIN_TILES;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      {grain > 0 ? (
        <Img
          src={staticFile(`textures/grain-${tile}.jpg`)}
          style={{
            position: "absolute",
            left: -((step * 37) % 120),
            top: -((step * 53) % 120),
            width: 1200,
            height: 2040,
            mixBlendMode: "overlay",
            opacity: grain * 2.5,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Garis bantu area aman. Hanya tampil dalam mode debug, tidak pernah di render final.
export const SafeAreaGuide: React.FC = () => {
  if (!isDebug()) return null;
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
