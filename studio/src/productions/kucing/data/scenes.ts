// Struktur waktu film (detik, global). Satu-satunya sumber kebenaran untuk
// durasi adegan; naskah (script.ts), isyarat visual, dan audio mengacu ke sini.

export const EPISODE = {
  id: "Kucing",
  title: "Kucingmu Menghabiskan 10 Tahun untuk Tidur",
  fps: 30,
} as const;

export const SCENES = [
  { id: "S1-Hook", from: 0, to: 12, purpose: "Hook: close-up kucing tidur di sofa, pertanyaan pembuka." },
  { id: "S2-FaktaTidur", from: 12, to: 31, purpose: "12–16 jam/hari: time-lapse sofa → kasur → jendela, jam 24 jam terisi." },
  { id: "S3-SeumurHidup", from: 31, to: 53.5, purpose: "15 tahun → 7,5 hingga 10 tahun tidur; ≈ 2/3 hidup." },
  { id: "S4-Manusia", from: 53.5, to: 79, purpose: "Bandingkan manusia (75 thn): tidur 25, HP 15, kerja 8, sisanya 27." },
  { id: "S5-Penutup", from: 79, to: 88, purpose: "Punchline: jangan sia-siakan waktumu — kucingnya malah tidur lagi." },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_SECONDS = SCENES[SCENES.length - 1].to;

export const sceneStart = (id: SceneId) => SCENES.find((s) => s.id === id)!.from;

// Detik global → frame lokal sebuah adegan.
export const at = (id: SceneId, globalSeconds: number) => Math.round((globalSeconds - sceneStart(id)) * EPISODE.fps);
