import React from "react";
import { useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { mix, rand } from "./geom";

// Debu melayang di berkas cahaya. Posisi dasar acak deterministik di dalam
// sebuah kotak (koordinat dunia), lalu hanyut pelan dengan noise. Partikel
// berkilau (opasitas berdenyut) seperti debu yang memantulkan sinar.
export const DustParticles: React.FC<{
  box: [number, number, number, number]; // x0, y0, x1, y1
  count?: number;
  intensity?: number;
  color?: string;
  size?: number;
  seed?: number;
}> = ({ box, count = 60, intensity = 1, color = "#FFF0CC", size = 1, seed = 3 }) => {
  const frame = useCurrentFrame();
  if (intensity < 0.02) return null;
  const t = frame / 30;
  const [x0, y0, x1, y1] = box;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const s = seed * 100 + i;
        const bx = mix(x0, x1, rand(s));
        const by = mix(y0, y1, rand(s + 0.5));
        const sp = 0.4 + rand(s + 1.3);
        const x = bx + noise2D(`dx${s}`, t * 0.08 * sp, 0) * 70 + t * 4 * sp;
        const y = by + noise2D(`dy${s}`, 0, t * 0.08 * sp) * 60 - t * 2.5 * sp;
        const r = (1.2 + rand(s + 2.1) * 3.2) * size;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + rand(s + 3) * 2) + i));
        const depthBlur = rand(s + 4.2) > 0.8; // sebagian di luar fokus: lebih besar & redup
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={depthBlur ? r * 2.6 : r}
            fill={color}
            opacity={intensity * tw * (depthBlur ? 0.25 : 0.8)}
          />
        );
      })}
    </g>
  );
};
