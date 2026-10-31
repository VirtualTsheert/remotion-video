// Naskah voice-over + isyarat visual yang harus sinkron dengannya.
//
// Waktu (detik global) adalah TARGET untuk perekaman voiceover.wav. Setelah
// rekaman masuk ke public/audio/kucing/, dengarkan di Studio lalu geser
// `from`/`to` di sini bila perlu: teks layar & angka mengikuti otomatis.

export type VoLine = { from: number; to: number; text: string };

export const VO: VoLine[] = [
  // S1 — Hook
  { from: 1.5, to: 3.6, text: "Pernah kepikiran nggak?" },
  { from: 4.0, to: 10.2, text: "Kalau kucingmu hidup sampai usia 15 tahun, sebenarnya berapa lama dia menghabiskan waktunya untuk tidur?" },
  // S2 — Fakta tidur
  { from: 13.5, to: 20.5, text: "Rata-rata kucing tidur sekitar 12 sampai 16 jam setiap hari." },
  { from: 21.5, to: 27.5, text: "Artinya, sebagian besar waktunya dihabiskan untuk beristirahat." },
  // S3 — Skala seumur hidup
  { from: 33.5, to: 44.5, text: "Kalau dihitung selama 15 tahun, waktu tidurnya bisa mencapai sekitar tujuh setengah hingga sepuluh tahun." },
  { from: 47.5, to: 52.8, text: "Bayangkan, hampir dua pertiga hidupnya hanya untuk tidur." },
  // S4 — Dibandingkan manusia
  { from: 54.0, to: 56.8, text: "Terus, gimana kalau dibandingkan dengan manusia?" },
  { from: 57.3, to: 62.8, text: "Kalau kamu hidup sampai 75 tahun, sekitar 25 tahun habis untuk tidur." },
  { from: 63.4, to: 67.2, text: "Sekitar 15 tahun buat main HP." },
  { from: 67.8, to: 71.4, text: "Sekitar 8 tahun buat kerja." },
  { from: 72.0, to: 78.4, text: "Sisanya cuma sekitar 27 tahun. Itu pun masih kepotong makan, macet, dan rebahan." },
  // S5 — Penutup
  { from: 79.6, to: 82.4, text: "Jadi, jangan sia-siakan waktumu." },
];

// ---------------------------------------------------------------------------
// Angka (dihitung di sini, bukan diketik):
// Kucing:
//   12 jam / 24 jam = 1/2  → 15 tahun × 1/2 = 7,5 tahun tidur
//   16 jam / 24 jam = 2/3  → 15 tahun × 2/3 = 10 tahun tidur
// Manusia (estimasi kasar, dibulatkan; aktivitas bisa tumpang tindih):
//   umur 75 tahun   — Umur Harapan Hidup Indonesia 2025: 74,47 tahun (BPS)
//   tidur 8 jam/hari sepanjang hidup            → 75 × 8/24          = 25 tahun
//   HP 6 jam/hari dari usia 15 s.d. 75 (60 thn) → 60 × 6/24          = 15 tahun
//     (rata-rata Indonesia 6,05 jam/hari, data.ai State of Mobile 2024)
//   kerja 40 jam/minggu, 50 minggu/thn, usia 22 s.d. 58 (36 thn)
//                                               → 40×50×36 / 8760    ≈ 8,2 → 8 tahun
//   sisanya                                     → 75 − 25 − 15 − 8  = 27 tahun
// ---------------------------------------------------------------------------
export const FACTS = {
  lifespanYears: 15,
  sleepLow: 12,
  sleepHigh: 16,
} as const;
export const sleepYears = (hours: number) => (FACTS.lifespanYears * hours) / 24;
export const awakeYears = (hours: number) => FACTS.lifespanYears - sleepYears(hours);

const HUMAN_LIFE = 75;
const humanSleep = (HUMAN_LIFE * 8) / 24;
const humanPhone = ((HUMAN_LIFE - 15) * 6) / 24;
const humanWork = Math.round((40 * 50 * (58 - 22)) / (24 * 365));
export const HUMAN = {
  life: HUMAN_LIFE,
  parts: [
    { key: "sleep", label: "TIDUR", years: humanSleep },
    { key: "phone", label: "MAIN HP", years: humanPhone },
    { key: "work", label: "KERJA", years: humanWork },
    { key: "rest", label: "SISANYA", years: HUMAN_LIFE - humanSleep - humanPhone - humanWork },
  ],
  sources: [
    "BPS — Umur Harapan Hidup Indonesia 2025: 74,47 tahun",
    "data.ai, State of Mobile 2024 — Indonesia 6,05 jam/hari di perangkat mobile (2023)",
    "UU Ketenagakerjaan/Cipta Kerja — 40 jam kerja per minggu",
  ],
} as const;

// Isyarat visual (detik global) — teks layar & angka muncul bersama kata di VO.
export const CUES = {
  hookTitle: 5.2, // "15 TAHUN KEHIDUPAN KUCING"
  hoursText: 15.2, // "12–16 JAM / HARI"
  lifetime15: 35.0, // "15 TAHUN"
  hours12: 38.0, // ring 12 jam
  years75: 40.0, // "7,5 TAHUN TIDUR"
  hours16: 42.5, // ring 16 jam
  years10: 44.0, // "10 TAHUN TIDUR"
  twoThirds: 48.5, // "≈ 2/3 HIDUPNYA"
  human: 54.6, // "MANUSIA · 75 TAHUN"
  humanSleep: 60.0,
  humanPhone: 63.6,
  humanWork: 68.0,
  humanRest: 72.4,
  humanCut: 75.2, // "makan, macet, rebahan" memotong sisa waktu
  endText: 80.4, // "JANGAN SIA-SIAKAN WAKTUMU"
  catSleepsAgain: 83.0,
} as const;

export const ON_SCREEN = {
  hook: ["15 TAHUN", "KEHIDUPAN KUCING"],
  hours: "12–16 JAM / HARI",
  end: ["JANGAN SIA-SIAKAN", "WAKTUMU"],
} as const;
