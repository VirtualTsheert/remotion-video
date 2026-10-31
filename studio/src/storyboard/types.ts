import type React from "react";
import type { TransitionSpec } from "../engine/transitions";

// Teknik visual utama sebuah shot. Dipilih berdasarkan kebutuhan cerita,
// bukan disamakan untuk semua adegan.
export type Technique =
  | "3d-environment"
  | "parallax-2.5d"
  | "motion-graphics"
  | "object-animation"
  | "title";

export type Shot = {
  // Dipakai sebagai ID composition: hanya huruf, angka, dan "-".
  id: string;
  // Tujuan naratif: apa yang harus dipahami penonton dari shot ini.
  purpose: string;
  technique: Technique;
  // Deskripsi gerak kamera dan alasannya (dokumentasi untuk sutradara/editor).
  camera: string;
  durationInFrames: number;
  component: React.FC;
  // Transisi MASUK dari shot sebelumnya. Shot pertama mengabaikannya.
  transitionIn?: TransitionSpec;
  // Naskah voice-over acuan untuk mengatur durasi. Tidak dirender.
  voiceOver?: string;
  // Sumber fakta/aset yang dipakai shot ini.
  sources?: string[];
  // Shot berat (3D) dirender sekali menjadi video "plate" (`npm run plates`)
  // lalu dipakai ulang saat render final. Studio tetap memakai adegan hidup.
  plate?: boolean;
};

export type Production = {
  id: string;
  title: string;
  shots: Shot[];
  // Lapisan di atas semua shot dengan waktu global (mis. HUD, teks kartu).
  overlay?: React.FC;
  // Soundtrack lengkap (path di public/), diputar dari frame 0.
  soundtrack?: string;
  // Warna latar di balik shot.
  background?: string;
};
