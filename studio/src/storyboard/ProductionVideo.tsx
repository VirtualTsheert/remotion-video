import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { resolveTransition } from "../engine/transitions";
import { COLORS } from "../theme/tokens";
import { PRODUCTIONS } from "../productions";

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
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
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
          items.push(
            <TransitionSeries.Sequence
              key={shot.id}
              name={shot.id}
              durationInFrames={shot.durationInFrames}
            >
              <Component />
            </TransitionSeries.Sequence>,
          );
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
