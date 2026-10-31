import { noise2D } from "@remotion/noise";
import { EASE } from "../../../theme/tokens";
import { rand } from "./geom";

// ---------------------------------------------------------------------------
// Sistem pose kucing. Satu pose = sekumpulan angka (rig). Pose dicampur dengan
// interpolasi keyframe, lalu lapisan prosedural (napas, kedip, telinga, ekor,
// siklus jalan) ditambahkan di atasnya. Semua dihitung dari nomor frame →
// deterministik saat render.
//
// Koordinat lokal kucing: menghadap kanan (+x), tanah di y = 0, atas = -y.
// ---------------------------------------------------------------------------

export type Pose = {
  // Sendi bahu & pinggul (pangkal kaki depan/belakang).
  sx: number; sy: number; hx: number; hy: number;
  chest: number; haunch: number; sag: number; arch: number;
  // Kepala relatif terhadap bahu, kemiringan (derajat, + = menunduk).
  headX: number; headY: number; headR: number;
  // Target telapak (x relatif bahu/pinggul, y absolut).
  fnX: number; fnY: number; ffX: number; ffY: number;
  bnX: number; bnY: number; bfX: number; bfY: number;
  hock: number; // sudut tulang telapak belakang dari vertikal
  // Ekor: sudut pangkal (+ = naik), lengkungan total, amplitudo ayunan.
  tailA: number; tailC: number; tailW: number;
  // Wajah.
  eye: number; pupil: number; lookX: number; lookY: number; mouth: number; ear: number;
  // Besar napas (0 = halus saat terjaga, 1 = napas tidur dalam).
  breath: number;
  // Seberapa jauh siklus jalan dipakai (0..1).
  gait: number;
};

const STAND: Pose = {
  sx: 85, sy: -128, hx: -85, hy: -124, chest: 50, haunch: 54, sag: 8, arch: 4,
  headX: 56, headY: -64, headR: -4,
  fnX: 8, fnY: 0, ffX: -8, ffY: 0, bnX: 8, bnY: 0, bfX: -8, bfY: 0, hock: 22,
  tailA: 30, tailC: 50, tailW: 10,
  eye: 1, pupil: 0.45, lookX: 0, lookY: 0, mouth: 0, ear: 0, breath: 0.3, gait: 0,
};

export const POSES = {
  stand: STAND,
  walk: { ...STAND, gait: 1, headY: -58, headR: 2, tailA: 38, tailC: 60 },
  sit: {
    ...STAND,
    sx: 66, sy: -150, hx: -48, hy: -50, chest: 50, haunch: 62, sag: 0, arch: 0,
    headX: 46, headY: -80, headR: -8,
    fnX: 24, ffX: 12, bnX: 72, bfX: 62, hock: 88,
    tailA: -70, tailC: -150, tailW: 4,
  },
  // Tidur "roti" (sphinx): dagu di atas kaki depan, ekor melingkar ke depan.
  loaf: {
    ...STAND,
    sx: 78, sy: -60, hx: -80, hy: -54, chest: 46, haunch: 56, sag: -6, arch: 12,
    headX: 60, headY: -22, headR: 16,
    fnX: 70, ffX: 56, bnX: 58, bfX: 44, hock: 90,
    tailA: -10, tailC: -175, tailW: 2,
    eye: 0, ear: -6, breath: 1,
  },
  // Tidur melingkar dalam: punggung membulat, kepala tenggelam ke badan.
  curl: {
    ...STAND,
    sx: 64, sy: -56, hx: -70, hy: -54, chest: 50, haunch: 58, sag: -10, arch: 34,
    headX: 52, headY: -6, headR: 34,
    fnX: 50, ffX: 40, bnX: 66, bfX: 50, hock: 90,
    tailA: -20, tailC: -210, tailW: 2,
    eye: 0, ear: -10, breath: 1,
  },
  // Peregangan (play bow): dada rendah, pantat tinggi, kaki depan lurus jauh.
  stretch: {
    ...STAND,
    sx: 92, sy: -62, hx: -78, hy: -136, chest: 46, haunch: 54, sag: 14, arch: -14,
    headX: 66, headY: -30, headR: -14,
    fnX: 100, ffX: 86, bnX: 6, bfX: -10, hock: 14,
    tailA: 70, tailC: 30, tailW: 6, eye: 0.15, ear: -14,
  },
  // Siap menerkam/bermain.
  crouch: {
    ...STAND,
    sx: 80, sy: -84, hx: -78, hy: -96, chest: 48, haunch: 56, sag: 4, arch: 6,
    headX: 64, headY: -40, headR: 4,
    fnX: 30, ffX: 20, bnX: 30, bfX: 20, hock: 60,
    tailA: 6, tailC: 10, tailW: 22, pupil: 1,
  },
  // Makan: kepala turun ke mangkuk.
  eat: {
    ...STAND,
    sx: 80, sy: -112, hx: -84, hy: -122, arch: 10,
    headX: 70, headY: 56, headR: 52,
    fnX: 22, ffX: 6, tailA: 18, tailC: 40, tailW: 6, eye: 0.35,
  },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

// Keyframe pose: pose dasar + override opsional (mis. { eye: 0 }).
export type PoseKey = { frame: number; pose: PoseName; set?: Partial<Pose>; ease?: (t: number) => number };

export const poseTrack = (keys: PoseKey[], frame: number): Pose => {
  let i = 0;
  while (i < keys.length - 1 && frame >= keys[i + 1].frame) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const span = b.frame - a.frame;
  const raw = span <= 0 ? 1 : Math.min(1, Math.max(0, (frame - a.frame) / span));
  const t = (b.ease ?? EASE.inOut)(raw);
  const pa = { ...POSES[a.pose], ...a.set } as Pose;
  const pb = { ...POSES[b.pose], ...b.set } as Pose;
  const out = { ...pa };
  for (const k of Object.keys(pa) as (keyof Pose)[]) out[k] = pa[k] + (pb[k] - pa[k]) * t;
  return out;
};

// ---------------------------------------------------------------------------
// Lapisan prosedural.
// ---------------------------------------------------------------------------

export type Living = {
  t: number; // waktu (detik) untuk ayunan ekor, napas
  breathPhase: number; // -1..1
  blink: number; // 0..1 (1 = mata tertutup karena kedip)
  earTwitch: number; // derajat
  walkPhase: number; // radian
};

// Kedip alami: jadwal acak deterministik, ~setiap 2,5–5 dtk, 5 frame.
const blinkAt = (frame: number, seed: number) => {
  let start = 10 + Math.floor(rand(seed) * 40);
  let i = 1;
  while (start < frame - 8) {
    start += 75 + Math.floor(rand(seed + i * 7.3) * 80);
    i++;
  }
  const d = frame - start;
  if (d < 0 || d > 6) return 0;
  return Math.sin((d / 6) * Math.PI);
};

export const living = (frame: number, fps: number, seed = 1, walkPhase = 0): Living => {
  const t = frame / fps;
  // Napas: ~0,4 Hz terjaga, diperlambat saat tidur oleh pemanggil lewat pose.breath.
  const breathPhase = Math.sin(t * 2 * Math.PI * 0.32 + seed);
  // Kedutan telinga sesekali.
  const tw = noise2D(`ear${seed}`, t * 0.6, 0);
  const earTwitch = tw > 0.55 ? (tw - 0.55) * 60 : 0;
  return { t, breathPhase, blink: blinkAt(frame, seed), earTwitch, walkPhase };
};

// Siklus jalan diagonal: kaki depan-dekat sefase dengan belakang-jauh.
export const applyGait = (p: Pose, phase: number): Pose => {
  if (p.gait <= 0) return p;
  const g = p.gait;
  const stride = 34;
  const lift = 22;
  const step = (ph: number) => ({
    dx: Math.cos(ph) * stride,
    dy: -Math.max(0, Math.sin(ph)) * lift,
  });
  const a = step(phase);
  const b = step(phase + Math.PI);
  const c = step(phase + Math.PI * 0.5);
  const d = step(phase + Math.PI * 1.5);
  return {
    ...p,
    fnX: p.fnX + a.dx * g, fnY: p.fnY + a.dy * g,
    bfX: p.bfX + c.dx * g, bfY: p.bfY + c.dy * g,
    ffX: p.ffX + b.dx * g, ffY: p.ffY + b.dy * g,
    bnX: p.bnX + d.dx * g, bnY: p.bnY + d.dy * g,
    sy: p.sy + Math.sin(phase * 2) * 3 * g,
    hy: p.hy + Math.sin(phase * 2 + 1) * 3 * g,
    headY: p.headY + Math.sin(phase * 2 + 0.6) * 2.5 * g,
  };
};

// Fase jalan dari jarak tempuh (px dalam skala kucing) agar kaki tidak "meluncur".
export const phaseFromDistance = (distance: number) => (distance / (34 * 4)) * Math.PI * 2;
