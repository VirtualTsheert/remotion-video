import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS, TYPE } from "../../theme/fonts";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";

// Uji motion graphics SVG: garis rute digambar bertahap + penanda lokasi.
export const MapShot: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [10, 70], [1, 0], { ...clamp, easing: EASE.inOut });
  const pin = interpolate(frame, [65, 80], [0, 1], { ...clamp, easing: EASE.cinematic });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} x2={1080} y1={160 * i} y2={160 * i} stroke={COLORS.paperDark} strokeWidth={2} />
        ))}
        <path
          d="M 200 1450 C 300 1100, 700 1200, 760 900 S 600 600, 820 480"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={draw}
        />
        <circle cx={820} cy={480} r={28 * pin} fill={COLORS.accent} />
        <circle cx={820} cy={480} r={28 + 60 * pin} fill="none" stroke={COLORS.accent} strokeWidth={4} opacity={1 - pin} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 260,
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: TYPE.body,
          color: COLORS.ink,
          opacity: pin,
        }}
      >
        Titik tujuan
      </div>
      <Finish grain={0.12} vignette={0.35} />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
