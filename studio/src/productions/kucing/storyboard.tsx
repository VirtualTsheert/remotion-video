import React from "react";
import { AbsoluteFill, getInputProps } from "remotion";
import { AudioManager } from "./components/AudioManager";
import { Captions } from "./components/Typography";
import { seconds } from "../../config/video";
import type { Production, Shot } from "../../storyboard/types";
import { EPISODE, SCENES, type SceneId } from "./data/scenes";
import { VO } from "./data/script";
import { Scene01Hook } from "./scenes/Scene01Hook";
import { Scene02SleepingFacts } from "./scenes/Scene02SleepingFacts";
import { Scene03Lifetime } from "./scenes/Scene03Lifetime";
import { Scene04Human } from "./scenes/Scene04Human";
import { Scene05Ending } from "./scenes/Scene05Ending";

const COMPONENTS: Partial<Record<SceneId, React.FC>> = {
  "S1-Hook": Scene01Hook,
  "S2-FaktaTidur": Scene02SleepingFacts,
  "S3-SeumurHidup": Scene03Lifetime,
  "S4-Manusia": Scene04Human,
  "S5-Penutup": Scene05Ending,
};

// Lapisan global di atas semua adegan: audio + subtitle VO.
// Subtitle bisa dimatikan: --props='{"captions":false}'.
const Overlay: React.FC = () => (
  <AbsoluteFill>
    <AudioManager />
    {getInputProps().captions === false ? null : <Captions />}
  </AbsoluteFill>
);

export const kucing: Production = {
  id: EPISODE.id,
  title: EPISODE.title,
  background: "#0E0A07",
  overlay: Overlay,
  shots: SCENES.filter((s) => COMPONENTS[s.id]).map(
    (s): Shot => ({
      id: s.id,
      purpose: s.purpose,
      technique: "parallax-2.5d",
      camera: "Lihat keyframe CinematicCamera di file adegan.",
      durationInFrames: seconds(s.to) - seconds(s.from),
      component: COMPONENTS[s.id]!,
      voiceOver: VO.filter((l) => l.from >= s.from && l.from < s.to)
        .map((l) => l.text)
        .join(" "),
    }),
  ),
};
