import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { landing, lerp } from "../animation/motion";
import { EASE, clamp } from "../../theme/tokens";

type From = "top" | "bottom" | "left" | "right" | [number, number];

const offsetFor = (from: From, distance: number): [number, number] => {
  if (Array.isArray(from)) return from;
  return {
    top: [0, -distance],
    bottom: [0, distance],
    left: [-distance, 0],
    right: [distance, 0],
  }[from] as [number, number];
};

// Meletakkan objek fisik ke permukaan (meja, papan): bergeser masuk dalam
// keadaan "terangkat" (lebih besar, bayangan lebar), lalu mendarat dan diam.
// Opsional: diangkat & dibawa keluar pada `exitAt`.
export const Place: React.FC<{
  at: number;
  from?: From;
  distance?: number;
  rotate?: number;
  // Rotasi tambahan selama masuk; menyusut ke 0 saat mendarat.
  spin?: number;
  exitAt?: number;
  exitTo?: From;
  shadow?: boolean;
  children: React.ReactNode;
}> = ({ at, from = "bottom", distance = 1400, rotate = 0, spin = 10, exitAt, exitTo = "left", shadow = true, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = landing(frame, at, fps);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 18], [0, 1], { ...clamp, easing: EASE.inOut });
  const [fx, fy] = offsetFor(from, distance);
  const [ex, ey] = offsetFor(exitTo, distance);
  // "Ketinggian" objek di atas meja: 1 saat melayang, 0 saat mendarat.
  const lift = Math.max(1 - land, 0) * 0.9 + exit;
  const x = lerp(fx, 0, land) + ex * exit;
  const y = lerp(fy, 0, land) + ey * exit;
  if (frame < at - 1) return null;
  return (
    <div
      style={{
        translate: `${x}px ${y}px`,
        rotate: `${rotate + spin * (1 - land) - spin * 0.5 * exit}deg`,
        scale: 1 + lift * 0.06,
        boxShadow: shadow
          ? `0 ${6 + lift * 40}px ${14 + lift * 60}px rgba(0,0,0,${0.45 - lift * 0.15})`
          : undefined,
      }}
    >
      {children}
    </div>
  );
};
