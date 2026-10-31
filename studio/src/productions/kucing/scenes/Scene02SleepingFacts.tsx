import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CinematicCamera, ParallaxLayer } from "../components/Camera";
import { CatCharacter } from "../components/CatCharacter";
import { poseTrack } from "../components/CatAnimation";
import { FgLeaves, LivingRoom, SPOTS } from "../components/Environment";
import { Grade, SunPatch, daylight } from "../components/Lighting";
import { AnimatedTypography } from "../components/Typography";
import { SleepDial } from "../components/Timeline";
import { CUES, ON_SCREEN } from "../data/script";
import { at } from "../data/scenes";
import { clamp } from "../../../theme/tokens";

// SCENE 2 — FAKTA TIDUR (12–31 dtk)
// Time-lapse satu hari di ruangan yang sama: sofa (pagi) → kasur (sore) →
// bantal dekat jendela (senja → malam). Kamera "whip pan" di antara lokasi
// (motion blur) menyembunyikan perpindahan kucing. Cahaya & bayangan bergeser
// mengikuti jam 24 jam yang berputar cepat di atas.
const S = "S2-FaktaTidur" as const;
const DUR = 570;
const WHIP = Easing.bezier(0.7, 0, 0.3, 1);

// Jam di dunia cerita: 06:00 → 06:00 esok (24 jam dalam 19 detik).
const hoursAt = (f: number) => 6 + interpolate(f, [0, DUR - 30], [0, 24], clamp);

export const Scene02SleepingFacts: React.FC = () => {
  const frame = useCurrentFrame();
  const hours = hoursAt(frame);
  const tod = interpolate(hours, [6, 9, 13, 17.5, 19, 21, 30], [0.22, 0.3, 0.48, 0.7, 0.8, 0.95, 1], clamp);
  const d = daylight(tod);
  const night = d.lamp;

  const sofa = SPOTS.sofa;
  const bed = SPOTS.bed;
  const cush = SPOTS.cushion;
  const camY = (y: number, zoom: number) => y - 150 / zoom;

  // Pose tidur di tiap lokasi, dengan sedikit gerak berganti posisi tidur.
  const sofaPose = poseTrack([{ frame: 0, pose: "curl" }, { frame: 120, pose: "curl", set: { ear: -14 } }, { frame: 170, pose: "curl" }], frame);
  const bedPose = poseTrack(
    [
      { frame: 190, pose: "loaf", set: { eye: 0 } },
      { frame: 260, pose: "loaf", set: { eye: 0, tailW: 8 } },
      { frame: 300, pose: "curl" },
    ],
    frame,
  );
  const cushPose = poseTrack([{ frame: 400, pose: "curl", set: { headR: 40 } }, { frame: 570, pose: "curl", set: { headR: 30 } }], frame);

  const dialIn = interpolate(frame, [30, 60], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const dialOut = interpolate(frame, [DUR - 24, DUR], [1, 0], clamp);
  const catLight = { rim: 0.4 + d.sun * 0.5, tint: [1 - night * 0.18, 1 - night * 0.14, 1] as [number, number, number] };

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A120C" }}>
      <CinematicCamera
        anchor={[sofa.x, sofa.y]}
        handheld={4}
        keys={[
          { frame: 0, x: sofa.x + 160, y: camY(sofa.y, 1.6), zoom: 1.6 },
          { frame: 165, x: sofa.x - 60, y: camY(sofa.y, 1.45), zoom: 1.45 },
          { frame: 200, x: bed.x + 140, y: camY(bed.y, 1.5), zoom: 1.5, ease: WHIP },
          { frame: 375, x: bed.x - 40, y: camY(bed.y, 1.62), zoom: 1.62 },
          { frame: 410, x: cush.x + 40, y: camY(cush.y, 1.5), zoom: 1.5, ease: WHIP },
          { frame: 570, x: cush.x - 30, y: camY(cush.y, 1.7), zoom: 1.7 },
        ]}
      >
        <LivingRoom
          d={d}
          tod={tod}
          clockHours={hours}
          dust={0.6}
          bgBlur={2}
          foreground={
            <>
              <FgLeaves x={3150} y={2150} s={1.2} />
              <FgLeaves x={1420} y={1900} s={1.0} flip />
            </>
          }
        >
          {frame < 190 ? <CatCharacter id="s2a" pose={sofaPose} x={sofa.x} y={sofa.y} seed={4} light={catLight} /> : null}
          {frame >= 180 && frame < 400 ? <CatCharacter id="s2b" pose={bedPose} x={bed.x} y={bed.y} seed={5} light={catLight} /> : null}
          {frame >= 390 ? <CatCharacter id="s2c" pose={cushPose} x={cush.x} y={cush.y} seed={6} light={catLight} /> : null}
        </LivingRoom>
        <ParallaxLayer depth={1} blend="screen">
          {/* bercak matahari bergeser di sepanjang hari */}
          {frame < 190 ? <SunPatch x={sofa.x + 40 - frame * 1.2} y={sofa.y - 80} r={380} k={d.sun * 0.6} /> : null}
          {frame >= 180 && frame < 400 ? <SunPatch x={bed.x + 260 - (frame - 180) * 1.5} y={bed.y - 80} r={420} k={d.sun * 0.75} color="#F8C27E" /> : null}
          {frame >= 390 ? <SunPatch x={cush.x} y={cush.y - 60} r={380} k={night * 0.35} color="#A9B9D8" /> : null}
        </ParallaxLayer>
      </CinematicCamera>
      <Grade ambient={d.ambient} vignette={0.62} warmth={0.2 * (1 - night)} />
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ position: "absolute", top: 250, transform: `scale(${0.85 + 0.15 * dialIn})` }}>
          <SleepDial hours={hours} size={340} opacity={dialIn * dialOut} />
        </div>
      </AbsoluteFill>
      <AnimatedTypography text={ON_SCREEN.hours} start={at(S, CUES.hoursText)} end={DUR - 6} y={660} size={78} tracking={0.04} weight={800} />
    </AbsoluteFill>
  );
};
