import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { focusOn, key } from "../engine/camera/Camera2D";
import { ParallaxScene } from "../engine/parallax/ParallaxScene";
import { Finish, SafeAreaGuide } from "../engine/layers/Finish";
import { EASE } from "../theme/tokens";

// Uji parallax 2.5D pada adegan uji berlapis (public/lab/street-*.svg).
// Kamera: push-in lambat sambil bergeser ke kanan menuju dua sosok —
// penonton dibawa "masuk" ke foto dan diarahkan ke subjeknya.
export const ParallaxLab: React.FC = () => (
  <AbsoluteFill>
    <ParallaxScene
      width={1600}
      height={2400}
      layers={[
        { src: staticFile("lab/street-sky.svg"), depth: 0.2 },
        { src: staticFile("lab/street-far.svg"), depth: 0.45 },
        { src: staticFile("lab/street-mid.svg"), depth: 0.8 },
        { src: staticFile("lab/street-near.svg"), depth: 1.25, fullBleed: true },
      ]}
      keys={[
        key(0, [700, 1350], 1.0),
        // Berakhir tepat pada dua sosok di lapisan depan (depth 1.25).
        key(179, focusOn([1270, 1820], 1.25, [800, 1200]), 1.7, { ease: EASE.inOut }),
      ]}
      handheld={{ amount: 3, rotate: 0.08 }}
    />
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);
