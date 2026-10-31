import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CinematicCamera, ParallaxLayer } from "../components/Camera";
import { CatCharacter } from "../components/CatCharacter";
import { poseTrack } from "../components/CatAnimation";
import { FgLeaves, LivingRoom, SPOTS } from "../components/Environment";
import { GodRays, Grade, SunPatch, daylight } from "../components/Lighting";
import { DustParticles } from "../components/Particles";
import { AnimatedTypography } from "../components/Typography";
import { Fade } from "../components/SceneTransition";
import { CUES, ON_SCREEN } from "../data/script";
import { at } from "../data/scenes";

// SCENE 1 — HOOK (0–12 dtk)
// Pagi. Kucing tidur melingkar di sofa. Kamera dolly-in pelan dari bidang
// sedang ke wajahnya; berkas matahari & debu melayang di depan lensa.
const S = "S1-Hook" as const;
const TOD = 0.33;

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const d = daylight(TOD);
  const cat = SPOTS.sofa;
  // Tidur pulas; telinga sesekali bergerak, ekor ujungnya mengibas sekali.
  const pose = poseTrack(
    [
      { frame: 0, pose: "curl", set: { tailW: 2 } },
      { frame: 200, pose: "curl", set: { tailW: 2, ear: -4 } },
      { frame: 240, pose: "curl", set: { tailW: 10, ear: -12 } },
      { frame: 300, pose: "curl", set: { tailW: 3, ear: -6 } },
    ],
    frame,
  );
  const face: [number, number] = [cat.x + 120, cat.y - 62];
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A120C" }}>
      <CinematicCamera
        anchor={face}
        handheld={5}
        keys={[
          { frame: 0, x: cat.x + 10, y: cat.y - 260, zoom: 1.05 },
          { frame: 330, x: face[0] - 30, y: face[1] - 20, zoom: 3.5 },
          { frame: 360, x: face[0] - 28, y: face[1] - 18, zoom: 3.6 },
        ]}
      >
        <LivingRoom
          d={d}
          tod={TOD}
          clockHours={7.2 + frame / 30 / 3600}
          dust={0.6}
          bgBlur={Math.min(7, Math.max(0, (frame - 60) / 40))}
          foreground={
            <>
              <FgLeaves x={cat.x - 430} y={cat.y + 330} s={1.3} />
              <FgLeaves x={cat.x + 560} y={cat.y + 520} s={1.1} flip color="#2E3A2A" />
            </>
          }
        >
          <CatCharacter id="s1cat" pose={pose} x={cat.x} y={cat.y} seed={4} light={{ rim: 0.9 }} />
        </LivingRoom>
        <ParallaxLayer depth={1} blend="screen">
          <SunPatch x={cat.x + 30} y={cat.y - 70} r={420} k={0.55} />
          <GodRays origin={[2350, 250]} angle={46} length={2100} spread={22} k={0.75 - 0.45 * Math.min(1, frame / 300)} t={frame / 30} id="s1rays" />
          <DustParticles box={[cat.x - 500, cat.y - 700, cat.x + 500, cat.y + 50]} count={70} intensity={0.9} size={0.8} seed={7} />
        </ParallaxLayer>
        <ParallaxLayer depth={1.6} blur={6} blend="screen">
          <DustParticles box={[cat.x - 300, cat.y - 500, cat.x + 400, cat.y]} count={14} intensity={0.5} size={2.2} seed={11} />
        </ParallaxLayer>
      </CinematicCamera>
      <Grade ambient={d.ambient} vignette={0.6 + 0.15 * Math.min(1, frame / 300)} leak={0.35} leakX={0.1} warmth={0.25} />
      <AnimatedTypography text={ON_SCREEN.hook[0]} start={at(S, CUES.hookTitle)} end={at(S, 11.4)} y={270} size={120} tracking={0.04} font="serif" weight={900} />
      <AnimatedTypography text={ON_SCREEN.hook[1]} start={at(S, CUES.hookTitle) + 12} end={at(S, 11.4)} y={420} size={44} tracking={0.32} weight={600} stagger={6} />
      <Fade inFrames={36} />
    </AbsoluteFill>
  );
};
