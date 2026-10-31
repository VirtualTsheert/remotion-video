import React from "react";
import { type Pt, limb, spline } from "./geom";
import { FUR } from "./palette";

// Kepala kucing 3/4 menghadap kanan. Koordinat lokal kepala: pusat (0,0),
// lebar ±60. Semua ekspresi dikendalikan angka (deterministik).
export type FaceState = {
  eye: number; // 0 tertutup .. 1 terbuka
  pupil: number; // 0.15 celah .. 1 bulat penuh
  lookX: number; // -1..1
  lookY: number;
  mouth: number; // 0..1 menguap
  ear: number; // derajat, negatif = telinga rebah ke belakang
  earTwitch: number;
  rim: number; // cahaya tepi 0..1
};

const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  irisR: number;
  open: number;
  pupil: number;
  lookX: number;
  lookY: number;
  tilt: number;
}> = ({ id, cx, cy, w, h, irisR, open, pupil, lookX, lookY, tilt }) => {
  if (open < 0.08) {
    // Mata terpejam: garis lengkung lembut (ekspresi tenang).
    return (
      <g transform={`translate(${cx},${cy}) rotate(${tilt})`}>
        <path
          d={`M${-w / 2},${-1} Q0,${h * 0.32} ${w / 2},${-2}`}
          fill="none"
          stroke={FUR.darkLine}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        <path d={`M${-w / 2 + 2},${-4} Q0,${h * 0.1} ${w / 2 - 2},${-5}`} fill="none" stroke={FUR.top} strokeWidth={2} opacity={0.5} />
      </g>
    );
  }
  const hh = (h / 2) * open;
  const almond = `M${-w / 2},0 Q${-w * 0.1},${-hh * 1.55} ${w / 2},${-hh * 0.35} Q${w * 0.05},${hh * 1.35} ${-w / 2},0 Z`;
  const ix = lookX * w * 0.12;
  const iy = lookY * h * 0.12;
  return (
    <g transform={`translate(${cx},${cy}) rotate(${tilt})`}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={almond} />
        </clipPath>
        <radialGradient id={`${id}-iris`}>
          <stop offset="0" stopColor="#E5CE73" />
          <stop offset="0.6" stopColor={FUR.iris} />
          <stop offset="1" stopColor={FUR.irisRim} />
        </radialGradient>
      </defs>
      <path d={almond} fill="#F4EBD2" />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx={ix} cy={iy} r={irisR} fill={`url(#${id}-iris)`} />
        <ellipse cx={ix} cy={iy} rx={1.6 + irisR * 0.62 * pupil} ry={irisR * 0.9} fill={FUR.pupil} />
        {/* bayangan kelopak atas */}
        <ellipse cx={0} cy={-hh * 1.1} rx={w * 0.7} ry={hh * 0.7} fill="#3A2412" opacity={0.28} />
        <circle cx={ix + irisR * 0.35} cy={iy - irisR * 0.4} r={irisR * 0.26} fill="#FFFFFF" opacity={0.95} />
        <circle cx={ix - irisR * 0.3} cy={iy + irisR * 0.35} r={irisR * 0.11} fill="#FFFFFF" opacity={0.7} />
      </g>
      <path d={almond} fill="none" stroke={FUR.darkLine} strokeWidth={2.6} strokeLinejoin="round" />
    </g>
  );
};

const Ear: React.FC<{ base: [Pt, Pt]; tip: Pt; rot: number; far?: boolean; id: string }> = ({ base, tip, rot, far }) => {
  const [a, b] = base;
  const pivot: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const mid1: Pt = [(a[0] + tip[0]) / 2 - 4, (a[1] + tip[1]) / 2];
  const mid2: Pt = [(b[0] + tip[0]) / 2 + 3, (b[1] + tip[1]) / 2 + 2];
  const outer = spline([a, mid1, tip, mid2, b], false, 0.8) + " Z";
  const inA: Pt = [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25 - 4];
  const inB: Pt = [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75 - 4];
  const inTip: Pt = [tip[0] * 0.82 + pivot[0] * 0.18, tip[1] * 0.82 + pivot[1] * 0.18];
  const inner = spline([inA, inTip, inB], false, 0.6) + " Z";
  return (
    <g transform={`rotate(${rot} ${pivot[0]} ${pivot[1]})`}>
      <path d={outer} fill={far ? FUR.far : FUR.base} />
      <path d={inner} fill={FUR.innerEar} opacity={far ? 0.55 : 0.85} />
      {/* rambut telinga */}
      {!far
        ? [0.3, 0.5, 0.7].map((t, i) => (
            <path
              key={i}
              d={`M${inA[0] * (1 - t) + inB[0] * t},${inA[1] * (1 - t) + inB[1] * t} L${inTip[0] * 0.6 + pivot[0] * 0.4 + (i - 1) * 4},${inTip[1] * 0.6 + pivot[1] * 0.4}`}
              stroke="#FFF4E2"
              strokeWidth={1.3}
              opacity={0.7}
            />
          ))
        : null}
      <path d={outer} fill="none" stroke="#5A2E12" strokeOpacity={0.35} strokeWidth={1.4} />
    </g>
  );
};

export const CatFace: React.FC<{ id: string; s: FaceState }> = ({ id, s }) => {
  const m = s.mouth;
  const jaw = 22 * m;
  const skull: Pt[] = [
    [-50, -8],
    [-42, -38],
    [-12, -51],
    [24, -45],
    [50, -24],
    [63, 0],
    [60, 18],
    [50, 30 + jaw * 0.7],
    [32, 40 + jaw],
    [4, 42 + jaw * 0.7],
    [-26, 38],
    [-50, 20],
  ];
  // Jumbai pipi: bergerigi agar terlihat seperti bulu.
  const ruff: Pt[] = [];
  for (let i = 0; i <= 9; i++) {
    const a = Math.PI * (0.45 + i * 0.075);
    const r = i % 2 === 0 ? 50 : 60;
    ruff.push([Math.cos(a) * r - 8, Math.sin(a) * r * 0.82 + 4]);
  }
  const earRot = s.ear + s.earTwitch;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-head`} cx="0.62" cy="0.3" r="0.85">
          <stop offset="0" stopColor={FUR.light} />
          <stop offset="0.5" stopColor={FUR.base} />
          <stop offset="1" stopColor={FUR.top} />
        </radialGradient>
        <radialGradient id={`${id}-muzzle`}>
          <stop offset="0" stopColor="#FFF8EC" />
          <stop offset="0.7" stopColor={FUR.belly} />
          <stop offset="1" stopColor={FUR.belly} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-headRim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7B8" stopOpacity={s.rim} />
          <stop offset="0.5" stopColor="#FFE7B8" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* telinga jauh di belakang kepala */}
      <Ear id={`${id}-earF`} base={[[14, -44], [44, -32]]} tip={[38, -90]} rot={earRot * 0.8} far />
      <path d={spline(ruff, false)} fill={FUR.base} stroke={FUR.base} strokeWidth={10} strokeLinejoin="round" />
      <path d={spline(skull, true)} fill={`url(#${id}-head)`} />
      {/* rahang bawah saat menguap */}
      {m > 0.02 ? (
        <g>
          <ellipse cx={47} cy={26 + jaw * 0.5} rx={7 + 9 * m} ry={3 + 15 * m} fill="#3A1A16" />
          <ellipse cx={45} cy={32 + jaw * 0.75} rx={4 + 6 * m} ry={2 + 5 * m} fill="#D9706F" />
          <path d={`M${41},${22} l2.5,${5 + 4 * m} l2.5,${-5 - 4 * m} Z`} fill="#FFFDF5" />
          <path d={`M${54},${21} l2.2,${4 + 4 * m} l2.2,${-4 - 4 * m} Z`} fill="#FFFDF5" />
        </g>
      ) : null}
      {/* belang dahi (huruf "M") dan pipi */}
      {[
        [[-6, -50], [-2, -38], [2, -27]],
        [[8, -49], [10, -39], [11, -30]],
        [[-20, -47], [-18, -38], [-14, -31]],
        [[22, -44], [22, -36], [20, -30]],
      ].map((p, i) => (
        <path key={i} d={limb(p as Pt[], [7, 5, 1.5])} fill={FUR.stripe} opacity={0.85} />
      ))}
      {[
        [[2, 6], [-18, 10], [-38, 9]],
        [[2, 15], [-16, 22], [-32, 24]],
      ].map((p, i) => (
        <path key={i} d={limb(p as Pt[], [6, 4, 1])} fill={FUR.stripe} opacity={0.75} />
      ))}
      {/* moncong & dagu krem */}
      <ellipse cx={44} cy={20 + jaw * 0.2} rx={20} ry={13} fill={`url(#${id}-muzzle)`} />
      <ellipse cx={60} cy={18 + jaw * 0.2} rx={10} ry={11} fill={`url(#${id}-muzzle)`} />
      <ellipse cx={30} cy={36 + jaw} rx={18} ry={8} fill={`url(#${id}-muzzle)`} />
      <ellipse cx={30} cy={-10} rx={34} ry={18} fill={`url(#${id}-muzzle)`} opacity={0.35} />
      {/* hidung & mulut */}
      <path d="M55,3 Q63,0 67,4 Q63,10 60,11 Q56,8 55,3 Z" fill={FUR.nose} />
      <path d="M56,4 Q60,3 62,5" stroke="#FFE3DA" strokeWidth={1.2} opacity={0.6} fill="none" />
      {m < 0.1 ? (
        <path
          d="M60,11 L59,17 M59,17 Q54,21 49,19 M59,17 Q63,21 67,19"
          fill="none"
          stroke={FUR.darkLine}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.75}
        />
      ) : null}
      {/* mata: dekat & jauh (foreshortening 3/4) */}
      <Eye id={`${id}-eyeN`} cx={22} cy={-9} w={27} h={20} irisR={10.5} open={s.eye} pupil={s.pupil} lookX={s.lookX} lookY={s.lookY} tilt={-8} />
      <Eye id={`${id}-eyeF`} cx={52} cy={-12} w={15} h={17} irisR={7} open={s.eye} pupil={s.pupil} lookX={s.lookX} lookY={s.lookY} tilt={-4} />
      {/* telinga dekat */}
      <Ear id={`${id}-earN`} base={[[-34, -32], [0, -47]]} tip={[-24, -94]} rot={earRot} />
      {/* kumis */}
      <g stroke="#FFF7EA" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.8}>
        <path d="M50,18 Q80,8 112,10" />
        <path d="M50,21 Q82,19 114,26" />
        <path d="M49,24 Q78,28 106,40" />
        <path d="M66,16 Q88,6 108,4" opacity={0.6} />
      </g>
      {[[44, 16], [42, 21], [47, 20]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.1} fill="#8A5530" opacity={0.6} />
      ))}
      <path d={spline(skull, true)} fill="none" stroke={`url(#${id}-headRim)`} strokeWidth={3.5} strokeOpacity={0.75} />
      <path d={spline(skull, true)} fill="none" stroke="#5A2E12" strokeOpacity={0.3} strokeWidth={1.4} />
    </g>
  );
};
