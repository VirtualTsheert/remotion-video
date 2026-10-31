// Spesifikasi output tunggal untuk semua produksi: Instagram Reels 9:16, tanpa audio.
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Area aman: UI Instagram menutupi bagian atas (header) dan bawah (caption, tombol).
// Elemen penting (judul, label, angka kunci) harus berada di dalam kotak ini.
export const SAFE_AREA = {
  top: 220,
  bottom: 420,
  left: 80,
  right: 120,
} as const;

export const seconds = (s: number) => Math.round(s * VIDEO.fps);
