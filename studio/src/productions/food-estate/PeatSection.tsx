import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { progress } from "../../engine/animation/motion";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";
import { Body, Kicker, SourceTag, TopBlock } from "./ui";

// 6 · PENAMPANG GAMBUT — diagram ilustrasi (tidak berskala) mekanisme:
// kanal dibuka → muka air turun → gambut di atasnya mengering → mudah terbakar.

const X0 = 60;
const X1 = 1020;
const BOTTOM = 1400;
const CANAL = [150, 250] as const;
const dome = (x: number) => Math.sin((Math.PI * (x - X0)) / (X1 - X0));
const surface = (x: number) => 960 - 90 * dome(x);
// Muka air: awalnya tepat di bawah permukaan; setelah kanal, turun — paling dalam di dekat kanal.
const waterTable = (x: number, t: number) => {
  const near = Math.exp(-Math.abs(x - (CANAL[0] + CANAL[1]) / 2) / 260);
  const low = surface(x) + 120 + 150 * near;
  return surface(x) + 22 + (low - surface(x) - 22) * t;
};

const path = (fn: (x: number) => number, closeTo?: number) => {
  const pts: string[] = [];
  for (let x = X0; x <= X1; x += 12) pts.push(`${x},${fn(x).toFixed(1)}`);
  return closeTo === undefined
    ? `M${pts.join(" L")}`
    : `M${X0},${closeTo} L${pts.join(" L")} L${X1},${closeTo} Z`;
};

const Flame: React.FC<{
  x: number;
  frame: number;
  seed: number;
  p: number;
}> = ({ x, frame, seed, p }) => {
  const y = surface(x);
  const s = p * (0.75 + 0.35 * noise2D(`f${seed}`, frame * 0.12, 0));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d="M0,0 C-34,-30 -20,-80 0,-120 C20,-80 34,-30 0,0 Z"
        fill="#ff7a1a"
        opacity={0.95}
      />
      <path
        d="M0,0 C-16,-20 -10,-50 0,-74 C10,-50 16,-20 0,0 Z"
        fill="#ffd36b"
      />
    </g>
  );
};

export const PeatSection: React.FC = () => {
  const frame = useCurrentFrame();
  const canal = progress(frame, 60, 30, EASE.inOut);
  const drain = progress(frame, 95, 100, EASE.inOut);
  const fire = progress(frame, 200, 30, EASE.cinematic);
  const dry = interpolate(drain, [0.3, 1], [0, 1], clamp);
  const canalBottom = surface(CANAL[0]) + 260 * canal;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          <linearGradient id="peat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3d26" />
            <stop offset="1" stopColor="#2b1c12" />
          </linearGradient>
          <clipPath id="peatClip">
            <path d={path(surface, BOTTOM)} />
          </clipPath>
        </defs>
        {/* Tanah mineral di bawah gambut */}
        <rect x={X0} y={BOTTOM} width={X1 - X0} height={70} fill="#4a4a46" />
        {/* Tubuh gambut */}
        <path d={path(surface, BOTTOM)} fill="url(#peat)" />
        <g clipPath="url(#peatClip)">
          {/* Air di dalam gambut (di bawah muka air) */}
          <path
            d={path((x) => waterTable(x, drain), BOTTOM)}
            fill="#2f7fd6"
            opacity={0.42}
          />
          {/* Zona kering di atas muka air yang turun */}
          <path
            d={`${path(surface)} L${X1},${waterTable(X1, drain)} ${Array.from(
              { length: 81 },
              (_, i) => X1 - i * 12,
            )
              .map((x) => `L${x},${waterTable(x, drain).toFixed(1)}`)
              .join(" ")} Z`}
            fill="#b08a5a"
            opacity={0.55 * dry}
          />
          {/* Retakan pada gambut kering */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 330 + i * 75;
            const y = surface(x) + 10;
            return (
              <path
                key={i}
                d={`M${x},${y} l${8 - (i % 3) * 8},${30 + (i % 4) * 12} l10,26`}
                stroke="#3a2a1a"
                strokeWidth={4}
                fill="none"
                opacity={dry}
              />
            );
          })}
        </g>
        {/* Muka air (garis putus-putus) */}
        <path
          d={path((x) => waterTable(x, drain))}
          stroke="#8fd0ff"
          strokeWidth={5}
          strokeDasharray="18 12"
          fill="none"
        />
        {/* Kanal yang digali */}
        <path
          d={`M${CANAL[0]},${surface(CANAL[0]) - 2} L${CANAL[0] + 20},${canalBottom} L${CANAL[1] - 20},${canalBottom} L${CANAL[1]},${surface(CANAL[1]) - 2} Z`}
          fill={COLORS.ink}
        />
        <rect
          x={CANAL[0] + 20}
          y={canalBottom - 50 * canal}
          width={CANAL[1] - CANAL[0] - 40}
          height={50 * canal}
          fill="#2f7fd6"
          opacity={0.8}
        />
        {/* Aliran air menuju kanal */}
        {Array.from({ length: 14 }, (_, i) => {
          const t = ((frame * 0.006 + random(`w${i}`)) % 1) * drain;
          const x = 900 - t * 620;
          return drain > 0 && drain < 1 ? (
            <circle
              key={i}
              cx={x}
              cy={waterTable(x, drain) + 26}
              r={7}
              fill="#8fd0ff"
              opacity={0.85}
            />
          ) : null;
        })}
        {/* Pohon di permukaan */}
        {[330, 430, 560, 690, 820, 930].map((x, i) => (
          <g
            key={x}
            transform={`translate(${x},${surface(x)})`}
            opacity={1 - 0.6 * fire}
          >
            <rect x={-5} y={-110} width={10} height={110} fill="#1e2a1c" />
            <circle cx={0} cy={-130 - (i % 2) * 10} r={46} fill="#24402a" />
          </g>
        ))}
        {/* Api & asap */}
        {fire > 0
          ? [380, 520, 650, 780, 900].map((x, i) => (
              <g key={x}>
                {Array.from({ length: 4 }, (_, k) => {
                  const t = (frame * 0.01 + k * 0.25 + i * 0.13) % 1;
                  return (
                    <circle
                      key={k}
                      cx={x + noise2D(`s${i}${k}`, frame * 0.02, 0) * 40}
                      cy={surface(x) - 140 - t * 420}
                      r={40 + t * 70}
                      fill="#7d7a76"
                      opacity={(1 - t) * 0.35 * fire}
                    />
                  );
                })}
                <Flame x={x} frame={frame} seed={i} p={fire} />
              </g>
            ))
          : null}
        {/* Label */}
        <g fontFamily={FONTS.mono} fontSize={34} fill={COLORS.white}>
          <text x={CANAL[0] - 6} y={surface(CANAL[0]) - 30} opacity={canal}>
            KANAL
          </text>
          <text x={620} y={1300}>
            GAMBUT
          </text>
          <text x={760} y={waterTable(760, drain) + 70} fill="#8fd0ff">
            MUKA AIR
          </text>
          <text x={440} y={surface(440) + 80} opacity={dry} fill="#f2d7a8">
            KERING
          </text>
        </g>
      </svg>
      <TopBlock>
        <Kicker>BAGAIMANA GAMBUT TERBAKAR</Kicker>
        <Body at={6} until={95}>
          Gambut: tanah basah dari sisa tumbuhan
        </Body>
      </TopBlock>
      <div style={{ position: "absolute", left: 80, right: 120, top: 380 }}>
        <Body at={100} until={200}>
          Kanal menguras airnya
        </Body>
      </div>
      <div style={{ position: "absolute", left: 80, right: 120, top: 380 }}>
        <Body at={205}>Gambut yang kering mudah terbakar</Body>
      </div>
      <SourceTag>
        Diagram ilustrasi, tidak berskala · berdasarkan UGM (2020)
      </SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
