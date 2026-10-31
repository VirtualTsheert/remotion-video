import { Easing } from "remotion";

// Palet dokumenter investigatif: gelap, hangat seperti kertas arsip,
// dengan satu warna aksen merah untuk penanda bukti/temuan.
export const COLORS = {
  ink: "#0B0D10",
  night: "#141922",
  steel: "#2A3340",
  fog: "#8A96A8",
  paper: "#E9E1CF",
  paperDark: "#C9BC9F",
  sepia: "#8C6B3F",
  accent: "#D7362B",
  highlight: "#F2C14E",
  white: "#F5F3EE",
} as const;

// Easing yang dipakai ulang. "cinematic" = cepat di awal, mendarat halus.
export const EASE = {
  cinematic: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  drift: Easing.bezier(0.33, 0, 0.67, 1),
  linear: Easing.linear,
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
