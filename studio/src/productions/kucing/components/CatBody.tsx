import React from "react";
import { type Pt, add, deg, ik2, len, limb, mul, rad, spline, sub } from "./geom";
import type { Living, Pose } from "./CatAnimation";
import { FUR } from "./palette";

// ---------------------------------------------------------------------------
// Rig: dari pose → posisi sendi semua bagian tubuh (koordinat lokal kucing).
// ---------------------------------------------------------------------------

const GROUND = -5; // sendi tidak boleh menembus lantai

export type Leg = { root: Pt; mid: Pt; hock?: Pt; paw: Pt; lifted: boolean };

export type Rig = {
  S: Pt; H: Pt; L: number; angle: number; u: Pt; up: Pt;
  chest: number; haunch: number; sag: number; arch: number;
  head: Pt; headR: number;
  fn: Leg; ff: Leg; bn: Leg; bf: Leg;
};

const frontLeg = (root: Pt, paw: Pt): Leg => {
  const mid = ik2(root, paw, 70, 68, 1);
  return { root, mid: [mid[0], Math.min(mid[1], GROUND)], paw, lifted: paw[1] < -4 };
};

const hindLeg = (root: Pt, paw: Pt, hockDeg: number): Leg => {
  const h = rad(hockDeg);
  const hock: Pt = [paw[0] - Math.sin(h) * 50, Math.min(paw[1] - Math.cos(h) * 50, GROUND)];
  const knee = ik2(root, hock, 62, 72, -1);
  return { root, mid: [knee[0], Math.min(knee[1], GROUND)], hock, paw, lifted: paw[1] < -4 };
};

export const buildRig = (p: Pose, lv: Living): Rig => {
  // Napas: dada & perut mengembang. Saat tidur lebih dalam dan lebih lambat.
  const amp = 0.012 + 0.035 * p.breath;
  const b = lv.breathPhase;
  const chest = p.chest * (1 + amp * b);
  const haunch = p.haunch * (1 + amp * 0.4 * b);
  const sag = p.sag + 5 * p.breath * b;
  const S: Pt = [p.sx, p.sy - 2 * p.breath * b];
  const H: Pt = [p.hx, p.hy];
  const d = sub(S, H);
  const L = len(d);
  const u: Pt = [d[0] / L, d[1] / L];
  const up: Pt = [u[1], -u[0]];
  const head: Pt = [S[0] + p.headX, S[1] + p.headY - 1.5 * p.breath * b];
  return {
    S, H, L, u, up, angle: deg(Math.atan2(u[1], u[0])),
    chest, haunch, sag, arch: p.arch,
    head, headR: p.headR,
    fn: frontLeg([S[0] + 4, S[1] + 6], [S[0] + p.fnX, p.fnY]),
    ff: frontLeg([S[0] - 6, S[1] + 4], [S[0] + p.ffX - 6, p.ffY]),
    bn: hindLeg([H[0] + 6, H[1] + 4], [H[0] + p.bnX, p.bnY], p.hock),
    bf: hindLeg([H[0] - 4, H[1] + 2], [H[0] + p.bfX - 6, p.bfY], p.hock),
  };
};

// Titik di bingkai tulang punggung: a = sepanjang punggung dari pinggul, b = ke atas.
export const spinePt = (r: Rig, a: number, b: number): Pt => add(add(r.H, mul(r.u, a)), mul(r.up, b));

// Outline badan dalam koordinat tulang punggung (x sepanjang punggung, y ke bawah).
export const torsoPoints = (r: Rig): Pt[] => {
  const c = r.chest;
  const h = r.haunch;
  const L = r.L;
  const avg = (c + h) / 2;
  return [
    [-h * 0.95, -h * 0.08],
    [-h * 0.6, -h * 0.8],
    [0, -h * 0.98],
    [L * 0.5, -(Math.max(c, h) * 0.86 + r.arch)],
    [L, -c * 0.98],
    [L + c * 0.62, -c * 0.7],
    [L + c * 0.98, -c * 0.02],
    [L + c * 0.52, c * 0.84],
    [L * 0.72, c * 0.9 + r.sag * 0.6],
    [L * 0.42, avg * 0.84 + r.sag],
    [h * 0.3, h * 0.9],
    [-h * 0.58, h * 0.66],
  ];
};

// ---------------------------------------------------------------------------
// Gambar
// ---------------------------------------------------------------------------

export const CatTorso: React.FC<{ rig: Rig; id: string; rim: number }> = ({ rig, id, rim }) => {
  const path = spline(torsoPoints(rig), true);
  const h = rig.haunch;
  const c = rig.chest;
  const top = -Math.max(c, h) - rig.arch;
  // Garis-garis tabby melintang di punggung.
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const x = -h * 0.55 + (i / 7) * (rig.L + c * 0.55);
    const reach = 0.25 + 0.35 * Math.abs(Math.sin(i * 1.7));
    return limb(
      [
        [x + 7, top - 10],
        [x + 1, top * 0.45],
        [x - 5, top * (0.2 - reach)],
      ],
      [17, 11, 2],
    );
  });
  return (
    <g transform={`translate(${rig.H[0]},${rig.H[1]}) rotate(${rig.angle})`}>
      <defs>
        <linearGradient id={`${id}-torso`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={h}>
          <stop offset="0" stopColor={FUR.top} />
          <stop offset="0.42" stopColor={FUR.base} />
          <stop offset="0.7" stopColor={FUR.light} />
          <stop offset="1" stopColor={FUR.belly} />
        </linearGradient>
        <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={0}>
          <stop offset="0" stopColor="#FFE7B8" stopOpacity={rim} />
          <stop offset="1" stopColor="#FFE7B8" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-haunchShade`} cx="0" cy="0" r={h * 1.1} gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="#5A2A10" stopOpacity="0" />
          <stop offset="1" stopColor="#5A2A10" stopOpacity="0.28" />
        </radialGradient>
        <clipPath id={`${id}-torsoClip`}>
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill={`url(#${id}-torso)`} />
      <g clipPath={`url(#${id}-torsoClip)`}>
        {stripes.map((d, i) => (
          <path key={i} d={d} fill={FUR.stripe} opacity={0.82} />
        ))}
        {/* bayangan bawah perut (ambient occlusion simulatif) */}
        <ellipse cx={rig.L * 0.45} cy={h * 1.05} rx={rig.L * 0.75} ry={h * 0.45} fill="#6B3A1A" opacity={0.22} />
        <ellipse cx={0} cy={0} rx={h * 1.1} ry={h * 1.1} fill={`url(#${id}-haunchShade)`} />
      </g>
      <path d={path} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={4} strokeOpacity={0.75} />
      <path d={path} fill="none" stroke="#5A2E12" strokeOpacity={0.35} strokeWidth={1.5} />
    </g>
  );
};

// Pita belang kecil melintang di kaki.
const legBands = (pts: Pt[], at: number[], width: number) =>
  at.map((u) => {
    const i = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
    const t = u * (pts.length - 1) - i;
    const a = pts[i];
    const b = pts[i + 1];
    const p: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const dv = sub(b, a);
    const l = len(dv) || 1;
    const n: Pt = [-dv[1] / l, dv[0] / l];
    return limb([add(p, mul(n, width * 0.7)), add(p, mul(n, -width * 0.7))], [7, 3]);
  });

const Paw: React.FC<{ at: Pt; color: string; flip?: boolean; lifted: boolean }> = ({ at, color, lifted }) => (
  <g transform={`translate(${at[0]},${at[1] - 6}) rotate(${lifted ? -25 : 0})`}>
    <ellipse cx={6} cy={0} rx={17} ry={8.5} fill={color} />
    <path d="M10,-4 L11,5 M16,-3 L17,5" stroke="#8A5530" strokeOpacity={0.45} strokeWidth={1.4} strokeLinecap="round" />
  </g>
);

export const FrontLeg: React.FC<{ leg: Leg; far?: boolean; id: string; clipId: string }> = ({ leg, far, clipId }) => {
  const pts: Pt[] = [leg.root, leg.mid, leg.paw];
  const k = far ? 0.88 : 1;
  const d = limb(pts, [40 * k, 22 * k, 17 * k]);
  const fill = far ? FUR.far : FUR.base;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${clipId})`}>
        {legBands(pts, [0.55, 0.7, 0.84], 16).map((b, i) => (
          <path key={i} d={b} fill={FUR.stripe} opacity={far ? 0.5 : 0.7} />
        ))}
        {/* sisi belakang kaki lebih terang (bulu krem) */}
        <path d={limb([leg.mid, leg.paw], [9, 7])} fill={FUR.belly} opacity={0.35} transform="translate(-6,0)" />
      </g>
      <Paw at={leg.paw} color={far ? "#C98A55" : FUR.light} lifted={leg.lifted} />
    </g>
  );
};

export const HindLeg: React.FC<{ leg: Leg; far?: boolean; haunch: number; id: string; clipId: string }> = ({
  leg,
  far,
  haunch,
  clipId,
}) => {
  const hock = leg.hock ?? leg.paw;
  const k = far ? 0.88 : 1;
  const lower = limb([leg.mid, hock, leg.paw], [30 * k, 15 * k, 15 * k]);
  // Paha: elips besar di sepanjang tulang paha.
  const thighC: Pt = [(leg.root[0] * 0.55 + leg.mid[0] * 0.45), (leg.root[1] * 0.55 + leg.mid[1] * 0.45)];
  const thighAng = deg(Math.atan2(leg.mid[1] - leg.root[1], leg.mid[0] - leg.root[0]));
  const fill = far ? FUR.far : FUR.base;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={lower} />
        </clipPath>
        <radialGradient id={`${clipId}-thigh`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={far ? "#B97441" : FUR.light} />
          <stop offset="0.6" stopColor={fill} />
          <stop offset="1" stopColor={FUR.top} />
        </radialGradient>
      </defs>
      <path d={lower} fill={fill} />
      <g clipPath={`url(#${clipId})`}>
        {legBands([leg.mid, hock, leg.paw], [0.2, 0.36, 0.52], 14).map((b, i) => (
          <path key={i} d={b} fill={FUR.stripe} opacity={far ? 0.5 : 0.7} />
        ))}
      </g>
      {!far ? (
        <g transform={`translate(${thighC[0]},${thighC[1]}) rotate(${thighAng})`}>
          <ellipse rx={haunch * 0.86} ry={haunch * 0.7} fill={`url(#${clipId}-thigh)`} />
          {[-0.4, 0, 0.4].map((o, i) => (
            <path
              key={i}
              d={limb(
                [
                  [o * haunch - 6, -haunch * 0.62],
                  [o * haunch, -haunch * 0.2],
                  [o * haunch + 4, haunch * 0.05],
                ],
                [12, 8, 2],
              )}
              fill={FUR.stripe}
              opacity={0.7}
            />
          ))}
          <ellipse rx={haunch * 0.86} ry={haunch * 0.7} fill="none" stroke="#5A2E12" strokeOpacity={0.25} strokeWidth={1.5} />
        </g>
      ) : null}
      <Paw at={leg.paw} color={far ? "#C98A55" : FUR.light} lifted={leg.lifted} />
    </g>
  );
};

// Leher + bib krem di dada.
export const CatNeck: React.FC<{ rig: Rig; id: string }> = ({ rig, id }) => {
  const c = rig.chest;
  const base = spinePt(rig, rig.L + c * 0.15, c * 0.15);
  const headBase = add(rig.head, [-22, 14]);
  const mid: Pt = [(base[0] + headBase[0]) / 2 + 6, (base[1] + headBase[1]) / 2];
  const d = limb([base, mid, headBase], [c * 1.75, c * 1.45, 66]);
  const bib = spinePt(rig, rig.L + c * 0.55, -c * 0.15);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={FUR.top} />
          <stop offset="0.55" stopColor={FUR.base} />
          <stop offset="1" stopColor={FUR.light} />
        </linearGradient>
        <radialGradient id={`${id}-bib`}>
          <stop offset="0" stopColor={FUR.belly} stopOpacity={0.95} />
          <stop offset="0.6" stopColor={FUR.belly} stopOpacity={0.6} />
          <stop offset="1" stopColor={FUR.belly} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${id}-neck)`} />
      <ellipse
        cx={bib[0]}
        cy={bib[1]}
        rx={c * 0.62}
        ry={c * 0.85}
        transform={`rotate(${rig.angle - 15} ${bib[0]} ${bib[1]})`}
        fill={`url(#${id}-bib)`}
      />
      <ellipse
        cx={(bib[0] + headBase[0]) / 2 + 8}
        cy={(bib[1] + headBase[1]) / 2 + 6}
        rx={c * 0.45}
        ry={c * 0.6}
        fill={`url(#${id}-bib)`}
        opacity={0.8}
      />
    </g>
  );
};
