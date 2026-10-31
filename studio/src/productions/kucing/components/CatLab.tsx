import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { POSES, type PoseName, phaseFromDistance, poseTrack } from "./CatAnimation";
import { CatCharacter } from "./CatCharacter";

// Lembar uji karakter: semua pose dasar + transisi pose + siklus jalan.
// Dipakai untuk memeriksa rig, bukan bagian dari film.
const NAMES = Object.keys(POSES) as PoseName[];

export const CatLab: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = poseTrack(
    [
      { frame: 0, pose: "loaf" },
      { frame: 30, pose: "loaf", set: { eye: 0.6 } },
      { frame: 60, pose: "stretch" },
      { frame: 90, pose: "sit", set: { mouth: 1, eye: 0, headR: -38, ear: -18 } },
      { frame: 120, pose: "sit" },
      { frame: 150, pose: "stand" },
    ],
    frame % 180,
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#EFE2CB, #D9C3A1)" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {NAMES.map((n, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const gx = 290 + col * 520;
          const gy = 330 + row * 330;
          return (
            <g key={n}>
              <line x1={gx - 240} x2={gx + 240} y1={gy} y2={gy} stroke="#00000022" />
              <CatCharacter
                id={`lab-${n}`}
                pose={POSES[n]}
                x={gx}
                y={gy}
                scale={0.95}
                seed={i + 1}
                walkPhase={n === "walk" ? phaseFromDistance(frame * 4) : 0}
              />
              <text x={gx - 230} y={gy + 30} fontSize={22} fill="#5A4030" fontFamily="sans-serif">
                {n}
              </text>
            </g>
          );
        })}
        <CatCharacter id="lab-cycle" pose={cycle} x={560} y={1800} scale={1.2} seed={9} />
      </svg>
    </AbsoluteFill>
  );
};
