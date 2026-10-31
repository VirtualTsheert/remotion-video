// Data episode "1 Sendok = Seumur Hidup 12 Lebah".
// Semua teks kartu, angka, dan kurva HUD ada di sini. Episode hewan berikutnya
// cukup mengganti file ini (adegan visual menyesuaikan sendiri bila perlu).
//
// File ini sengaja TANPA import dan hanya memakai tipe yang bisa dihapus, karena
// juga dibaca langsung oleh Node (`scripts/synth-lebah-audio.mts`) untuk menyusun
// soundtrack dengan waktu yang sama persis.
//
// Satuan waktu: detik (video 60 dtk, 30 fps).

export type Keyframes = [number, number][];

// Teks kartu: *kata* = kata kunci berwarna amber. Ikon sebaris: [check] [globe] [honey] [finger].
export type CardSpec = {
  from: number;
  to: number;
  lines: string[];
  // Angka besar di bawah teks (berputar naik dari `bigFrom`).
  big?: { value: number; from?: number; prefix?: string; suffix?: string };
  small?: boolean;
};

export const EPISODE = {
  id: "Lebah",
  title: "1 Sendok = Seumur Hidup 12 Lebah",
  duration: 60,
  heroTag: "#37.214",
  mission: "1/12 sdt",
};

export const CARDS: CardSpec[] = [
  { from: -1, to: 1.6, lines: ["Satu sendok teh madu ini…"] },
  { from: 1.6, to: 3.6, lines: ["…adalah hasil", "*seumur hidup 12 lebah.*"], big: { value: 12, from: 1 } },
  { from: 3.6, to: 5.1, lines: ["Kita ikuti satu."] },
  { from: 5.1, to: 6.8, lines: ["Hari 1:", "membersihkan selnya sendiri."] },
  { from: 6.8, to: 8.6, lines: ["Hari 3–11:", "mengasuh bayi lebah."] },
  { from: 8.6, to: 10.3, lines: ["Hari 12–17:", "membangun sarang."] },
  { from: 10.3, to: 12.0, lines: ["Hari 18–21:", "menjaga pintu."] },
  { from: 12.0, to: 14.0, lines: ["Tiga minggu.", "Progress misi: *0%.*"] },
  { from: 15.2, to: 17.0, lines: ["Hari 22. Akhirnya…", "terbang keluar."] },
  { from: 17.0, to: 20.0, lines: ["*±25 km/jam.*"] },
  { from: 20.0, to: 23.0, lines: ["Sayap mengepak", "*±200 kali* per detik."] },
  { from: 23.0, to: 26.0, lines: ["*50–100 bunga,*", "sekali jalan."] },
  { from: 26.0, to: 29.0, lines: ["Progress: *3%.*", "…Sabar."] },
  { from: 29.2, to: 32.5, lines: ["Hari 30.", "Sayapnya mulai *robek.*"] },
  { from: 32.5, to: 36.0, lines: ["Setiap robekan =", "*satu perjalanan.*"] },
  { from: 36.0, to: 38.4, lines: ["99%…", "*100% [check] MISI SELESAI*"] },
  { from: 38.4, to: 40.0, lines: ["Hasil seumur hidup:", "*1/12 sendok teh.*"] },
  { from: 40.6, to: 43.3, lines: ["Hari ±35.", "Ia tidak pulang lagi."] },
  { from: 43.5, to: 45.0, lines: ["Tapi tetesannya *sampai.*"] },
  { from: 45.0, to: 46.6, lines: ["*12 lebah* = 1 sendok teh."] },
  { from: 46.6, to: 48.4, lines: ["1 botol 500 gram ≈"], big: { value: 850, from: 12, suffix: " lebah" } },
  { from: 48.4, to: 50.2, lines: ["≈ *2,2 juta* bunga.", "≈ *97 ribu km* terbang."] },
  { from: 50.2, to: 52.0, lines: ["Hampir *2,5× keliling Bumi* [globe]"] },
  { from: 52.0, to: 55.0, lines: ["Lalu kita aduk ke teh…", "*3 detik.*"] },
  { from: 55.0, to: 57.3, lines: ["Madu bisa awet *ribuan tahun.*", "Dari hidup yang cuma *±5 minggu.*"] },
  { from: 57.3, to: 59.25, lines: ["Habiskan, ya. [honey]"] },
  { from: 57.6, to: 59.25, lines: ["Hewan apa berikutnya? [finger]"], small: true },
  // Kartu 1 kembali di ujung → frame terakhir = frame pertama (video loop).
  { from: 59.3, to: 61, lines: ["Satu sendok teh madu ini…"] },
];

// Adegan (satu komponen per adegan). Jumlah durasi = 60 dtk.
export const SCENES = [
  { id: "Sendok", from: 0, to: 1.6 },
  { id: "Tetes", from: 1.6, to: 3.6 },
  { id: "Pilih", from: 3.6, to: 5.0 },
  { id: "Sarang", from: 5.0, to: 12.0 },
  { id: "Macet", from: 12.0, to: 14.0 },
  { id: "Keluar", from: 14.0, to: 17.0 },
  { id: "Taman", from: 17.0, to: 26.0 },
  { id: "Sabar", from: 26.0, to: 29.0 },
  { id: "Menua", from: 29.0, to: 36.0 },
  { id: "Selesai", from: 36.0, to: 40.0 },
  { id: "Senja", from: 40.0, to: 43.5 },
  { id: "Perjalanan", from: 43.5, to: 45.0 },
  { id: "Skala", from: 45.0, to: 52.0 },
  { id: "Teh", from: 52.0, to: 55.0 },
  { id: "Penutup", from: 55.0, to: 60.0 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

// ---------- HUD ----------
export const HUD = {
  bootAt: 3.8,
  // Elemen HUD padam satu per satu saat senja.
  off: { mission: 41.0, wing: 41.7, day: 42.4, tag: 43.0 },
  day: [
    [5.0, 1], [6.6, 2.99], [6.9, 3], [8.5, 11.99], [8.7, 12], [10.2, 17.99], [10.4, 18], [11.9, 21.99],
    [14.9, 21.99], [15.0, 22], [17.0, 22], [26.0, 26.99], [29.0, 29.99], [29.3, 30], [36.0, 34.99], [40.0, 35.99],
  ] as Keyframes,
  wing: [[29.0, 1], [36.0, 0.2], [40.0, 0.12], [41.6, 0]] as Keyframes,
  progress: [
    [17.0, 0], [26.0, 0.03], [29.0, 0.03], [35.5, 0.92], [36.6, 0.95], [37.6, 0.99], [38.2, 0.99], [38.5, 1],
  ] as Keyframes,
};

export const interp = (k: Keyframes, t: number) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return k[k.length - 1][1];
};

export const dayAt = (t: number) => Math.max(1, Math.floor(interp(HUD.day, t)));
export const wingAt = (t: number) => interp(HUD.wing, t);
export const progressAt = (t: number) => interp(HUD.progress, t);

// ---------- Taman: kunjungan bunga ----------
// 64 bunga dalam satu perjalanan (rentang nyata 50–100). Makin lama makin cepat
// karena kamera menjauh. Posisi deterministik di dunia 3000×4200 px.
export const GARDEN = {
  start: 17.4,
  end: 25.8,
  count: 64,
  final: 64,
};

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const gardenVisitTime = (i: number) =>
  GARDEN.start + (GARDEN.end - GARDEN.start) * Math.pow(i / (GARDEN.count - 1), 0.55);

// Rute berliku dari tengah dunia: spiral longgar dengan jitter.
export const gardenFlowers = () =>
  Array.from({ length: GARDEN.count }, (_, i) => {
    const a = i * 0.62 + 0.4;
    const r = 120 + i * 21;
    return {
      x: 1500 + Math.cos(a) * r + (rand(i) - 0.5) * 140,
      y: 2100 + Math.sin(a) * r * 1.25 + (rand(i + 99) - 0.5) * 140,
      hue: Math.floor(rand(i + 7) * 4),
      size: 0.8 + rand(i + 3) * 0.5,
    };
  });

// ---------- Skala ----------
export const SCALE = {
  dropsStart: 45.05,
  dropsEnd: 46.4,
  jarAt: 46.6,
  globeAt: 48.4,
  wrapAt: 50.2,
  wraps: 2.5,
};

// ---------- Cue suara ----------
// Musik 4 babak + SFX. Waktu dalam detik; dibaca oleh skrip sintesis.
export const MUSIC = {
  chiptune: [3.6, 29.0] as [number, number],
  chipBreak: [26.0, 26.3] as [number, number],
  piano: [29.0, 40.0] as [number, number],
  silence: [40.0, 43.5] as [number, number],
  pianoNote: 43.5,
  swell: [45.0, 52.0] as [number, number],
  musicBox: [55.0, 60.0] as [number, number],
};

export type SfxKind =
  | "plop" | "musicbox" | "bass" | "pop" | "boot" | "blip" | "error" | "whoosh" | "shimmer"
  | "ding" | "softDing" | "tick" | "clink" | "flapHeavy";

export const SFX: { t: number; kind: SfxKind; v?: number; p?: number }[] = [
  { t: 0.0, kind: "musicbox", p: 76 },
  { t: 1.0, kind: "plop" },
  { t: 1.6, kind: "bass" },
  ...Array.from({ length: 12 }, (_, i) => ({ t: 2.0 + i * 0.09, kind: "pop" as const, p: i })),
  { t: 3.8, kind: "boot" },
  ...[5.1, 6.8, 8.6, 10.3].map((t) => ({ t, kind: "blip" as const })),
  { t: 12.5, kind: "error" },
  { t: 14.1, kind: "whoosh" },
  { t: 15.0, kind: "shimmer" },
  ...Array.from({ length: GARDEN.count }, (_, i) => ({ t: gardenVisitTime(i), kind: "ding" as const, p: i })),
  { t: 36.6, kind: "tick" },
  { t: 37.6, kind: "tick" },
  { t: 38.5, kind: "softDing" },
  { t: 44.85, kind: "plop", v: 0.5 },
  ...Array.from({ length: 11 }, (_, i) => ({ t: 45.15 + i * 0.12, kind: "plop" as const, v: 0.45 })),
  { t: 48.4, kind: "whoosh", v: 0.6 },
  { t: 50.2, kind: "whoosh", v: 0.5 },
  { t: 52.5, kind: "clink" },
  ...Array.from({ length: 9 }, (_, i) => ({ t: 53.1 + i * 0.2, kind: "clink" as const, v: 0.7 })),
  { t: 56.0, kind: "plop", v: 0.8 },
];
