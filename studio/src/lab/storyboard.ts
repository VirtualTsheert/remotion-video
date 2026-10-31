import { seconds } from "../config/video";
import type { Production } from "../storyboard/types";
import { DeskLab } from "./DeskLab";
import { ParallaxLab } from "./ParallaxLab";
import { MapLab } from "./MapLab";
import { ChronologyLab, NetworkLab } from "./GraphicsLab";
import { ThreeLab } from "./ThreeLab";

// Bangku uji Visual Engine: satu shot per kemampuan, bisa dipreview satu per satu
// (`npm run preview -- Lab-<Shot>`). Bukan video untuk dipublikasikan.
export const lab: Production = {
  id: "Lab",
  title: "Visual Engine Lab",
  shots: [
    {
      id: "Desk",
      purpose: "Kamera 2D (fokus + zoom + handheld) dan animasi objek di meja.",
      technique: "object-animation",
      camera: "Lebar untuk konteks → push-in ke dokumen bukti → pan ke foto.",
      durationInFrames: seconds(8),
      component: DeskLab,
    },
    {
      id: "Parallax",
      purpose: "Parallax 2.5D foto berlapis + debu dan kabut atmosfer.",
      technique: "parallax-2.5d",
      camera: "Push-in lambat + geser ke subjek (dua sosok di kanan bawah).",
      durationInFrames: seconds(6),
      component: ParallaxLab,
      transitionIn: { kind: "light-leak", durationInFrames: 24 },
    },
    {
      id: "Map",
      purpose: "Peta Natural Earth, label, pin, dan rute dengan kamera berbasis koordinat.",
      technique: "motion-graphics",
      camera: "Nusantara (konteks) → zoom ke Jawa → mengikuti rute.",
      durationInFrames: seconds(8),
      component: MapLab,
      transitionIn: { kind: "dip", durationInFrames: 20 },
    },
    {
      id: "Chronology",
      purpose: "Garis waktu vertikal; kamera otomatis berpindah ke peristiwa yang muncul.",
      technique: "motion-graphics",
      camera: "Tracking vertikal dari peristiwa ke peristiwa (chronologyCamera).",
      durationInFrames: seconds(8),
      component: ChronologyLab,
      transitionIn: { kind: "slide", durationInFrames: 20 },
    },
    {
      id: "Network",
      purpose: "Jaringan aktor: hubungan terdokumentasi vs dugaan, plus penghitung angka.",
      technique: "motion-graphics",
      camera: "Dekat pada tokoh utama → mundur memperlihatkan jaringan.",
      durationInFrames: seconds(8),
      component: NetworkLab,
      transitionIn: { kind: "push-in", durationInFrames: 18 },
    },
    {
      id: "City3D",
      purpose: "3D ringan: maket kota rekonstruksi (instanced, Lambert, kabut).",
      technique: "3d-environment",
      camera: "Orbit spiral turun dari atas kota menuju gedung lokasi kejadian.",
      durationInFrames: seconds(6),
      component: ThreeLab,
      plate: true,
      transitionIn: { kind: "wipe", durationInFrames: 18 },
    },
  ],
};
