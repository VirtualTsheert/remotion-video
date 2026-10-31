import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CinematicCamera, ParallaxLayer } from "../components/Camera";
import { CatCharacter } from "../components/CatCharacter";
import { poseTrack } from "../components/CatAnimation";
import { FgLeaves, LivingRoom, SPOTS } from "../components/Environment";
import { GodRays, Grade, SunPatch, daylight } from "../components/Lighting";
import { AnimatedTypography } from "../components/Typography";
import { Fade } from "../components/SceneTransition";
import { CUES, ON_SCREEN } from "../data/script";
import { at } from "../data/scenes";

// SCENE 5 — PENUTUP (79–88 dtk)
// Kembali ke ruang tamu yang hangat. Kucing duduk di bantal dekat jendela,
// menatap kita: "Jangan sia-siakan waktumu." Lalu ia menguap… dan tidur lagi.
const S = "S5-Penutup" as const;
const DUR = 270;
const TOD = 0.4;

export const Scene05Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const d = daylight(TOD);
  const cat = SPOTS.cushion;
  const sleep = at(S, CUES.catSleepsAgain);
  const pose = poseTrack(
    [
      { frame: 0, pose: "sit", set: { headR: -4, lookX: 0.6, lookY: 0.1 } },
      { frame: sleep - 30, pose: "sit", set: { headR: -2, lookX: 0.6, lookY: 0.1, ear: 3 } },
      { frame: sleep - 12, pose: "sit", set: { headR: -36, mouth: 1, eye: 0, ear: -18 } },
      { frame: sleep + 10, pose: "sit", set: { headR: -32, mouth: 0.9, eye: 0, ear: -16 } },
      { frame: sleep + 24, pose: "sit", set: { eye: 0.3 } },
      { frame: sleep + 60, pose: "loaf", set: { eye: 0.1 } },
      { frame: sleep + 95, pose: "curl" },
      { frame: DUR, pose: "curl" },
    ],
    frame,
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A120C" }}>
      <CinematicCamera
        anchor={[cat.x, cat.y]}
        handheld={4}
        keys={[
          { frame: 0, x: cat.x + 60, y: cat.y - 330, zoom: 1.7 },
          { frame: DUR, x: cat.x + 30, y: cat.y - 260, zoom: 1.95 },
        ]}
      >
        <LivingRoom
          d={d}
          tod={TOD}
          clockHours={10}
          dust={0.9}
          bgBlur={2.5}
          foreground={<FgLeaves x={cat.x + 520} y={cat.y + 500} s={1.1} flip />}
        >
          <CatCharacter id="s5cat" pose={pose} x={cat.x} y={cat.y} seed={14} light={{ rim: 0.85 }} />
        </LivingRoom>
        <ParallaxLayer depth={1} blend="screen">
          <SunPatch x={cat.x + 40} y={cat.y - 120} r={420} k={0.5} />
          <GodRays origin={[1900, 300]} angle={62} length={1700} spread={20} k={0.45} t={frame / 30} id="s5rays" />
        </ParallaxLayer>
      </CinematicCamera>
      <Grade ambient={d.ambient} vignette={0.6} leak={0.3} leakX={0.12} warmth={0.3} />
      <AnimatedTypography text={ON_SCREEN.end[0]} start={at(S, CUES.endText)} y={270} size={76} weight={800} tracking={0.06} />
      <AnimatedTypography text={ON_SCREEN.end[1]} start={at(S, CUES.endText) + 8} y={360} size={150} font="serif" weight={900} tracking={0.02} />
      <Fade inFrames={14} outFrames={36} color="#141A26" />
    </AbsoluteFill>
  );
};
