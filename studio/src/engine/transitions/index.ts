import { linearTiming, springTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { EASE } from "../../theme/tokens";
import { dip, lightLeak, pushIn } from "./presentations";

// Kosakata transisi yang dipakai storyboard. Setiap jenis punya makna naratif:
//  cut       — kesinambungan langsung, tanpa jeda
//  fade      — perpindahan waktu/lokasi yang tenang
//  wipe      — membuka bab/bukti baru
//  slide     — berpindah ke dokumen/data berikutnya
//  dip       — celup ke hitam: jeda waktu, pergantian bab
//  light-leak — kilau film: lompat ke materi arsip / masa lalu
//  push-in   — menembus ke detail: "masuk lebih dalam"
//
// Presentasi shader bawaan (film-burn, cross-zoom, dissolve, dst.) sengaja
// TIDAK dipakai: berbasis HtmlInCanvas dan memperlambat render seluruh video
// 10–40× pada WebGL CPU (swangle). Terukur di Codespace 2 vCPU. Tiga yang
// terakhir adalah pengganti murni CSS (presentations.tsx).
export type TransitionKind = "cut" | "fade" | "wipe" | "slide" | "dip" | "light-leak" | "push-in";

export type TransitionSpec = {
  kind: TransitionKind;
  durationInFrames: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentationFor = (kind: Exclude<TransitionKind, "cut">): TransitionPresentation<any> => {
  switch (kind) {
    case "fade":
      return fade();
    case "wipe":
      return wipe({ direction: "from-bottom" });
    case "slide":
      return slide({ direction: "from-right" });
    case "dip":
      return dip();
    case "light-leak":
      return lightLeak();
    case "push-in":
      return pushIn();
  }
};

export const resolveTransition = (spec: TransitionSpec) => {
  if (spec.kind === "cut") return null;
  return {
    presentation: presentationFor(spec.kind),
    timing:
      spec.kind === "slide"
        ? springTiming({
            config: { damping: 200 },
            durationInFrames: spec.durationInFrames,
          })
        : linearTiming({
            durationInFrames: spec.durationInFrames,
            easing: EASE.inOut,
          }),
  };
};
