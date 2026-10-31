import { seconds } from "../../config/video";
import type { Production } from "../../storyboard/types";
import { TitleShot } from "./TitleShot";
import { CityShot } from "./CityShot";
import { MapShot } from "./MapShot";

// Produksi uji pipeline: satu shot untuk tiap jalur teknis (DOM, 3D, SVG)
// dan dua jenis transisi CSS.
export const systemCheck: Production = {
  id: "SystemCheck",
  title: "System Check",
  shots: [
    {
      id: "Title",
      purpose: "Uji tipografi, font, dan finishing (grain + vignette).",
      technique: "title",
      camera: "Push-in 2D perlahan untuk menarik perhatian ke judul.",
      durationInFrames: seconds(3),
      component: TitleShot,
    },
    {
      id: "City",
      purpose: "Uji 3D environment dan kamera virtual (dolly + crane).",
      technique: "3d-environment",
      camera: "Crane turun sambil dolly maju menuju satu gedung beraksen.",
      durationInFrames: seconds(4),
      component: CityShot,
      transitionIn: { kind: "wipe", durationInFrames: 20 },
    },
    {
      id: "Map",
      purpose: "Uji motion graphics SVG: rute digambar ke titik tujuan.",
      technique: "motion-graphics",
      camera: "Statis — gerak ada pada garis rute.",
      durationInFrames: seconds(3),
      component: MapShot,
      transitionIn: { kind: "fade", durationInFrames: 15 },
    },
  ],
};
