import React from "react";
import { Composition, Folder } from "remotion";
import { VIDEO } from "./config/video";
import { PRODUCTIONS } from "./productions";
import { ProductionVideo } from "./storyboard/ProductionVideo";
import { productionDuration, validateProduction } from "./storyboard/timeline";

// Untuk setiap produksi:
//  - <ProductionId>              → video lengkap (untuk render final)
//  - folder <ProductionId>-Shots → tiap shot sebagai composition tersendiri
//                                  (preview/render satu adegan tanpa video penuh)
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {PRODUCTIONS.map((production) => {
        validateProduction(production);
        return (
          <React.Fragment key={production.id}>
            <Composition
              id={production.id}
              component={ProductionVideo}
              defaultProps={{ productionId: production.id }}
              durationInFrames={productionDuration(production)}
              {...VIDEO}
            />
            <Folder name={`${production.id}-Shots`}>
              {production.shots.map((shot) => (
                <Composition
                  key={shot.id}
                  id={`${production.id}-${shot.id}`}
                  // `plate` dibaca scripts/plates.mjs untuk memilih shot yang di-cache.
                  component={shot.component as React.FC<{ plate?: boolean }>}
                  defaultProps={{ plate: Boolean(shot.plate) }}
                  durationInFrames={shot.durationInFrames}
                  {...VIDEO}
                />
              ))}
            </Folder>
          </React.Fragment>
        );
      })}
    </>
  );
};
