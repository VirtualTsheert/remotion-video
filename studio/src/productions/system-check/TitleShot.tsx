import React from "react";
import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS, TYPE } from "../../theme/fonts";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";

// Uji tipografi + kamera 2D sederhana (push-in perlahan).
export const TitleShot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: interpolate(frame, [0, 90], [1.08, 1], { ...clamp, easing: EASE.drift }),
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE.label,
            letterSpacing: 8,
            color: COLORS.accent,
            opacity: interpolate(frame, [5, 25], [0, 1], clamp),
          }}
        >
          SYSTEM CHECK · 01
        </Interactive.Div>
        <Interactive.Div
          name="Headline"
          style={{
            fontFamily: FONTS.serif,
            fontWeight: 900,
            fontSize: TYPE.headline,
            color: COLORS.paper,
            textAlign: "center",
            marginTop: 24,
            opacity: interpolate(frame, [12, 40], [0, 1], { ...clamp, easing: EASE.cinematic }),
            translate: interpolate(frame, [12, 40], ["0px 40px", "0px 0px"], { ...clamp, easing: EASE.cinematic }),
          }}
        >
          Arsip yang
          <br />
          Terlupakan
        </Interactive.Div>
      </AbsoluteFill>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
