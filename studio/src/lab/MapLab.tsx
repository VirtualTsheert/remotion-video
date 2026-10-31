import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera2D, Layer, key } from "../engine/camera/Camera2D";
import { GeoMap, GeoRoute, MapLabel, MapPin } from "../engine/graphics/GeoMap";
import { geo, type LonLat } from "../engine/graphics/geo";
import { Finish, SafeAreaGuide } from "../engine/layers/Finish";
import { EASE } from "../theme/tokens";

// Koordinat dari Natural Earth populated places (public/geo/places.json).
const JAKARTA: LonLat = [106.827, -6.172];
const SEMARANG: LonLat = [110.418, -6.965];
const SURABAYA: LonLat = [112.749, -7.247];

// Uji peta: gambaran Nusantara → zoom ke Jawa → rute antarkota.
// Kamera mengikuti informasi: lebar untuk "di mana", dekat untuk "jalur apa".
export const MapLab: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      keys={[
        key(0, geo([118, -2.5]), 0.5),
        key(60, geo([117, -3]), 0.56, { ease: EASE.drift }),
        key(115, geo([109.8, -6.6]), 2.3),
        key(239, geo([109.9, -6.7]), 2.5, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <GeoMap highlight={["IDN"]} />
        <MapLabel at={[118, 8.5]} text="LAUT SULAWESI" start={10} end={80} />
        <MapLabel at={[110.5, -4.6]} text="LAUT JAWA" start={100} size={28} />
        <MapLabel at={[106, -12]} text="SAMUDRA HINDIA" start={10} end={80} />
        <GeoRoute points={[JAKARTA, SEMARANG, SURABAYA]} start={125} duration={80} bend={0.12} />
        <MapPin at={JAKARTA} start={118} label="Jakarta" side="top" />
        <MapPin at={SURABAYA} start={200} label="Surabaya" side="bottom" />
      </Layer>
    </Camera2D>
    <Finish vignette={0.6} />
    <SafeAreaGuide />
  </AbsoluteFill>
);
