import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

// Serif untuk judul (nuansa arsip/koran), sans untuk label & data,
// mono untuk tanggal, kode dokumen, dan koordinat.
export const FONTS = {
  serif: loadSerif("normal", { weights: ["700", "900"], subsets: ["latin"] })
    .fontFamily,
  sans: loadSans("normal", {
    weights: ["400", "600", "800"],
    subsets: ["latin"],
  }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] })
    .fontFamily,
} as const;

export const TYPE = {
  headline: 96,
  title: 72,
  body: 44,
  label: 32,
} as const;
