import type { Production } from "../../storyboard/types";
import { CatLab } from "./components/CatLab";

// Produksi uji untuk rig kucing (tidak ikut film). Buka "KucingLab" di Studio.
export const kucingLab: Production = {
  id: "KucingLab",
  title: "Kucing — uji karakter",
  shots: [
    {
      id: "Pose",
      purpose: "Memeriksa semua pose, siklus jalan, dan transisi pose.",
      technique: "object-animation",
      camera: "Statis.",
      durationInFrames: 180,
      component: CatLab,
    },
  ],
};
