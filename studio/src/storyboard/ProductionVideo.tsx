import React from "react";
import { AbsoluteFill, getInputProps, getRemotionEnvironment, getStaticFiles, staticFile } from "remotion";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { resolveTransition } from "../engine/transitions";
import { COLORS } from "../theme/tokens";
import { PRODUCTIONS } from "../productions";
import { isDebug } from "../config/video";

// Plate siap pakai untuk shot ini? Hanya saat render (bukan Studio) dan bisa
// dimatikan dengan --props='{"plates":false}'.
const plateFor = (compositionId: string) => {
  if (!getRemotionEnvironment().isRendering || getInputProps().plates === false) return null;
  const name = `plates/${compositionId}.mp4`;
  return getStaticFiles().some((f) => f.name === name) ? staticFile(name) : null;
};

// Merangkai shot sesuai urutan storyboard. Setiap shot dirender sebagai
// satu instance komponennya, sehingga di Studio ia terhubung ke composition
// shot tersebut (connected composition) dan bisa dibuka/diedit sendiri.
// Props hanya berisi ID karena props composition diserialisasi ke JSON
// (komponen React di dalam storyboard tidak bisa ikut terkirim).
export const ProductionVideo: React.FC<{ productionId: string }> = ({
  productionId,
}) => {
  const production = PRODUCTIONS.find((p) => p.id === productionId);
  if (!production) throw new Error(`Produksi "${productionId}" tidak terdaftar`);
  return (
    <AbsoluteFill style={{ backgroundColor: production.background ?? COLORS.ink }}>
      <TransitionSeries>
        {production.shots.flatMap((shot, i) => {
          const items: React.ReactNode[] = [];
          const transition =
            i > 0 && shot.transitionIn ? resolveTransition(shot.transitionIn) : null;
          if (transition) {
            items.push(
              <TransitionSeries.Transition
                key={`${shot.id}-in`}
                presentation={transition.presentation}
                timing={transition.timing}
              />,
            );
          }
          const Component = shot.component;
          const plate = shot.plate ? plateFor(`${production.id}-${shot.id}`) : null;
          items.push(
            <TransitionSeries.Sequence
              key={shot.id}
              name={shot.id}
              durationInFrames={shot.durationInFrames}
            >
              {plate ? (
                <AbsoluteFill>
                  <Video src={plate} muted style={{ width: "100%", height: "100%" }} />
                  {isDebug() ? (
                    <div style={{ position: "absolute", top: 40, right: 40, padding: "6px 14px", background: "#0a7", color: "white", font: "bold 32px sans-serif" }}>
                      PLATE
                    </div>
                  ) : null}
                </AbsoluteFill>
              ) : (
                <Component />
              )}
            </TransitionSeries.Sequence>,
          );
          return items;
        })}
      </TransitionSeries>
      {production.overlay ? <production.overlay /> : null}
      {production.soundtrack && getStaticFiles().some((f) => f.name === production.soundtrack) ? (
        <Audio src={staticFile(production.soundtrack)} />
      ) : null}
    </AbsoluteFill>
  );
};
