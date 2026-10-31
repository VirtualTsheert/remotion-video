import { interpolate, spring } from "remotion";
import { EASE, clamp } from "../../theme/tokens";
import type { Ease } from "../camera/track";

// Progres 0→1 dari `start` selama `duration` frame.
export const progress = (frame: number, start: number, duration: number, ease: Ease = EASE.cinematic) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: ease });

// Masuk lalu keluar: 0→1 di [start, start+inDur], 1→0 di [end-outDur, end].
export const inOut = (frame: number, start: number, end: number, inDur = 12, outDur = 12) =>
  interpolate(frame, [start, start + inDur, end - outDur, end], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE.inOut,
  });

// Pendaratan fisik (objek jatuh ke meja): sedikit memantul lalu diam.
export const landing = (frame: number, start: number, fps: number) =>
  spring({ frame: frame - start, fps, config: { damping: 15, mass: 0.9, stiffness: 120 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
