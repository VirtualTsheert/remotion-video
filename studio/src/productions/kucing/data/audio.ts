// Pengaturan audio per track (terpisah dari visual).
// File diletakkan di public/audio/kucing/. Track yang filenya belum ada
// dilewati otomatis (video tetap bisa dipreview & dirender).
//
// Semua waktu dalam detik global. `volume` = level dasar 0..1.

export const AUDIO_DIR = "audio/kucing";

export type Window = { from: number; to: number; volume?: number; fadeIn?: number; fadeOut?: number };

export type Track = {
  file: string;
  volume: number;
  loop?: boolean;
  // Rentang pemutaran. Kosong = sepanjang film.
  windows?: Window[];
  // Diturunkan otomatis saat voice-over berbicara (hanya bila voiceover.wav ada).
  duckUnderVo?: number; // pengali saat VO aktif, mis. 0.55
  // Efek sekali bunyi pada titik-titik waktu.
  hits?: number[];
};

export const TRACKS: Record<string, Track> = {
  voiceover: { file: "voiceover.wav", volume: 1 },
  music: {
    file: "background-music.mp3",
    volume: 0.55,
    duckUnderVo: 0.6,
    windows: [{ from: 0, to: 88, fadeIn: 4, fadeOut: 4 }],
  },
  ambient: {
    file: "ambient-room.wav",
    volume: 0.22,
    loop: true,
    windows: [
      { from: 0, to: 33, fadeIn: 2, fadeOut: 2 },
      { from: 79, to: 88, fadeIn: 1, fadeOut: 2 },
    ],
  },
  breathing: {
    file: "cat-breathing.wav",
    volume: 0.5,
    loop: true,
    windows: [
      { from: 0.5, to: 12.5, volume: 0.6, fadeIn: 3, fadeOut: 1 },
      { from: 12, to: 31, volume: 0.25, fadeIn: 1, fadeOut: 2 },
      { from: 84.5, to: 88, volume: 0.55, fadeIn: 1.5, fadeOut: 1.5 },
    ],
  },
  clock: {
    file: "clock-ticking.wav",
    volume: 0.35,
    loop: true,
    windows: [
      { from: 12.5, to: 31, fadeIn: 1.5, fadeOut: 1 },
      { from: 33, to: 50, volume: 0.22, fadeIn: 2, fadeOut: 3 },
      { from: 57, to: 72, volume: 0.18, fadeIn: 2, fadeOut: 2 },
    ],
  },
  whoosh: {
    file: "transition-whoosh.wav",
    volume: 0.4,
    // whip-pan S2 (×2), masuk ruang grafik S3, ke perbandingan manusia, kembali ke ruang tamu
    hits: [17.3, 24.8, 32.6, 53.2, 78.8],
  },
};

// Bentuk musik (dipakai juga oleh synth placeholder): bagian & intensitas.
export const MUSIC_SECTIONS = [
  { from: 0, to: 12, mood: "intro" },
  { from: 12, to: 31, mood: "time" },
  { from: 31, to: 53.5, mood: "numbers" },
  { from: 53.5, to: 79, mood: "human" },
  { from: 79, to: 88, mood: "outro" },
] as const;
