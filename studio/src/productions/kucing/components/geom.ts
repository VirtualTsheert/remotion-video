// Utilitas geometri kecil untuk menggambar karakter & lingkungan secara prosedural.

export type Pt = [number, number];

export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const len = (a: Pt) => Math.hypot(a[0], a[1]);
export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const f = (n: number) => n.toFixed(1);

// Kurva Catmull-Rom → path SVG kubik yang halus melewati semua titik.
export const spline = (pts: Pt[], closed = false, tension = 1): string => {
  if (pts.length < 2) return "";
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? d + " Z" : d;
};

// Bentuk anggota tubuh meruncing: polyline tulang + lebar di tiap titik → outline tertutup.
export const limb = (pts: Pt[], widths: number[]): string => {
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const d = sub(b, a);
    const l = len(d) || 1;
    const nrm: Pt = [-d[1] / l, d[0] / l];
    const w = widths[i] / 2;
    left.push(add(pts[i], mul(nrm, w)));
    right.push(add(pts[i], mul(nrm, -w)));
  }
  // Ujung membulat: titik tambahan di depan ujung dan di belakang pangkal.
  const endDir = sub(pts[n - 1], pts[n - 2]);
  const el = len(endDir) || 1;
  const tip = add(pts[n - 1], mul(endDir, (widths[n - 1] * 0.45) / el));
  const startDir = sub(pts[0], pts[1]);
  const sl = len(startDir) || 1;
  const root = add(pts[0], mul(startDir, (widths[0] * 0.3) / sl));
  return spline([...left, tip, ...right.reverse(), root], true);
};

// IK dua tulang: sendi tengah dari pangkal → target. bend = +1 / -1 memilih arah tekuk.
export const ik2 = (root: Pt, target: Pt, l1: number, l2: number, bend: number): Pt => {
  const d = sub(target, root);
  const dist = Math.min(Math.max(len(d), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = Math.acos((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist));
  const base = Math.atan2(d[1], d[0]);
  const ang = base + bend * a;
  return [root[0] + Math.cos(ang) * l1, root[1] + Math.sin(ang) * l1];
};

// Titik di sepanjang polyline (u = 0..1), dengan arah normal.
export const along = (pts: Pt[], u: number): { p: Pt; n: Pt } => {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = len(sub(pts[i + 1], pts[i]));
    segs.push(l);
    total += l;
  }
  let target = clamp01(u) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const t = segs[i] === 0 ? 0 : target / segs[i];
      const a = pts[i];
      const b = pts[i + 1];
      const d = sub(b, a);
      const l = len(d) || 1;
      return { p: [mix(a[0], b[0], t), mix(a[1], b[1], t)], n: [-d[1] / l, d[0] / l] };
    }
    target -= segs[i];
  }
  return { p: pts[pts.length - 1], n: [0, -1] };
};

// Random deterministik (untuk partikel, tekstur).
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Interpolasi warna hex.
const hex = (c: string): [number, number, number] => {
  const v = parseInt(c.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
export const mixColor = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = clamp01(t);
  const c = A.map((x, i) => Math.round(mix(x, B[i], k)));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};
// Banyak warna sepanjang 0..1.
export const ramp = (stops: [number, string][], t: number) => {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (t <= b) return mixColor(ca, cb, (t - a) / (b - a));
  }
  return stops[stops.length - 1][1];
};
