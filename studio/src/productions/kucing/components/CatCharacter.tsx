import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { type Pose, applyGait, living } from "./CatAnimation";
import { CatNeck, CatTorso, FrontLeg, HindLeg, buildRig } from "./CatBody";
import { CatFace } from "./CatFace";
import { CatTail, tailPoints } from "./CatTail";
import { mix } from "./geom";

export type CatLight = {
  rim?: number; // cahaya tepi hangat (matahari dari belakang/samping)
  // Pengali warna (1 = netral). Malam: biru & lebih gelap.
  tint?: [number, number, number];
  shadow?: number;
};

// Karakter kucing oranye tabby lengkap. Komponen ini tidak tahu cerita apa pun:
// adegan memberi pose (hasil poseTrack) + posisi; semua gerak hidup
// (napas, kedip, telinga, ekor, langkah) dihitung di sini dari frame.
export const CatCharacter: React.FC<{
  id: string;
  pose: Pose;
  x: number;
  y: number; // posisi lantai
  scale?: number;
  flip?: boolean; // true = menghadap kiri
  walkPhase?: number;
  seed?: number;
  light?: CatLight;
  fur?: boolean; // tekstur bulu prosedural (filter displacement)
}> = ({ id, pose, x, y, scale = 1, flip = false, walkPhase = 0, seed = 1, light = {}, fur = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lv0 = living(frame, fps, seed, walkPhase);
  // Napas tidur lebih lambat (≈ 20–25 per menit) daripada saat terjaga.
  const freq = mix(0.42, 0.36, pose.breath);
  const lv = { ...lv0, breathPhase: Math.sin((frame / fps) * 2 * Math.PI * freq + seed) };
  const p = applyGait(pose, walkPhase);
  const rig = buildRig(p, lv);
  const tail = tailPoints(rig, p, lv);
  const tailFront = p.tailC < -95;
  const rim = light.rim ?? 0.5;
  const [tr, tg, tb] = light.tint ?? [1, 1, 1];
  const eye = p.eye * (1 - lv.blink * (p.eye > 0.3 ? 1 : 0));
  const faceState = {
    eye,
    pupil: p.pupil,
    lookX: p.lookX,
    lookY: p.lookY,
    mouth: p.mouth,
    ear: p.ear,
    earTwitch: lv.earTwitch,
    rim,
  };
  const left = Math.min(rig.H[0] - rig.haunch, tail[tail.length - 1][0]);
  const right = Math.max(rig.S[0] + rig.chest, rig.head[0] + 60);
  const shadowW = (right - left) / 2;
  const shadowC = (right + left) / 2;
  const lowBody = Math.max(rig.S[1], rig.H[1]); // makin dekat lantai makin gelap
  const shadowK = mix(1, 0.55, Math.min(1, -lowBody / 140));

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <defs>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#1E140D" stopOpacity={0.55 * (light.shadow ?? 1) * shadowK} />
          <stop offset="1" stopColor="#1E140D" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-fur`} x="-15%" y="-25%" width="130%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={4.5} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix
            in="d"
            type="matrix"
            values={`${tr} 0 0 0 0  0 ${tg} 0 0 0  0 0 ${tb} 0 0  0 0 0 1 0`}
          />
        </filter>
        <filter id={`${id}-tint`}>
          <feColorMatrix type="matrix" values={`${tr} 0 0 0 0  0 ${tg} 0 0 0  0 0 ${tb} 0 0  0 0 0 1 0`} />
        </filter>
      </defs>
      <ellipse cx={shadowC} cy={-2} rx={shadowW * 1.05} ry={18} fill={`url(#${id}-shadow)`} />
      <g filter={`url(#${id}-${fur ? "fur" : "tint"})`}>
        <FrontLeg leg={rig.ff} far id={id} clipId={`${id}-ff`} />
        <HindLeg leg={rig.bf} far haunch={rig.haunch} id={id} clipId={`${id}-bf`} />
        {!tailFront ? <CatTail pts={tail} id={id} /> : null}
        <CatTorso rig={rig} id={id} rim={rim} />
        <HindLeg leg={rig.bn} haunch={rig.haunch} id={id} clipId={`${id}-bn`} />
        <CatNeck rig={rig} id={id} />
        <FrontLeg leg={rig.fn} id={id} clipId={`${id}-fn`} />
        <g transform={`translate(${rig.head[0]},${rig.head[1]}) rotate(${rig.headR})`}>
          <CatFace id={`${id}-face`} s={faceState} />
        </g>
        {tailFront ? <CatTail pts={tail} id={id} /> : null}
      </g>
    </g>
  );
};
