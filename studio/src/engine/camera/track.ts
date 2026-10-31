import { EASE } from "../../theme/tokens";

export type Ease = (t: number) => number;
type Value = number | readonly number[];

// Keyframe generik: nilai pada frame tertentu. `ease` mengatur segmen
// yang BERAKHIR di keyframe ini (dari keyframe sebelumnya ke sini).
export type Keyframe<V extends Record<string, Value>> = V & {
  frame: number;
  ease?: Ease;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Mengambil nilai track pada sebuah frame. Properti di `logKeys` diinterpolasi
// di ruang logaritmik (untuk zoom/skala: kecepatan perseptual konstan).
export const sampleTrack = <V extends Record<string, Value>>(
  keys: Keyframe<V>[],
  frame: number,
  logKeys: (keyof V)[] = [],
): V => {
  if (keys.length === 0) throw new Error("Track kamera kosong");
  let i = 0;
  while (i < keys.length - 1 && frame >= keys[i + 1].frame) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const span = b.frame - a.frame;
  const raw = span <= 0 ? 1 : Math.min(1, Math.max(0, (frame - a.frame) / span));
  const t = (b.ease ?? EASE.inOut)(raw);

  const out: Record<string, Value> = {};
  for (const k of Object.keys(a)) {
    if (k === "frame" || k === "ease") continue;
    const va = a[k] as Value;
    const vb = b[k] as Value;
    const mix = (x: number, y: number) =>
      logKeys.includes(k) ? Math.exp(lerp(Math.log(x), Math.log(y), t)) : lerp(x, y, t);
    out[k] = Array.isArray(va)
      ? (va as number[]).map((x, j) => mix(x, (vb as number[])[j]))
      : mix(va as number, vb as number);
  }
  return out as V;
};
