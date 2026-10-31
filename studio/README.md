# Cinematic Investigative Documentary Studio

Studio produksi video dokumenter investigatif untuk Instagram Reels, dibangun dengan
Remotion + React, Three.js (React Three Fiber), dan SVG/CSS.

**Spesifikasi output:** 1080×1920 (9:16) · 30 fps · H.264 yuv420p · tanpa audio · tanpa subtitle.
Voice-over ditambahkan terpisah setelah render.

## Persiapan (sekali per Codespace)

```bash
cd studio
bash scripts/setup-system.sh   # library Chrome headless + ffmpeg (ulang setelah rebuild Codespace)
npm install
```

## Preview

```bash
npm run dev
```

Studio berjalan di port 3000. Di Codespaces, buka tab **Ports** → port 3000 → ikon globe
(atau notifikasi "Open in Browser"). Preview memakai GPU browser Chrome Anda, jadi jauh
lebih cepat daripada render di server.

Di sidebar Studio:

- `<Produksi>` — video lengkap.
- folder `<Produksi>-Shots` — setiap shot sebagai composition tersendiri. Buka di sini untuk
  melihat/mengedit satu adegan tanpa memutar video penuh. Garis putus-putus hijau = area aman
  (hanya tampil di Studio).

## Render

```bash
npm run render -- SystemCheck                    # video lengkap → out/SystemCheck.mp4
npm run render -- SystemCheck-City               # satu shot saja
npm run render:draft -- SystemCheck              # setengah resolusi, cepat, untuk cek pacing
npm run still -- SystemCheck-City out/city.png --frame=60   # satu frame
npx remotion render SystemCheck out/x.mp4 --frames=60-90    # rentang frame tertentu
```

Hasil render tersimpan di `out/` (tidak di-commit). Untuk mengunduh: klik kanan file di
Explorer VS Code → **Download**.

## Quality Control

```bash
npm run qc -- out/SystemCheck.mp4               # target durasi default 60–180 dtk
npm run qc -- out/SystemCheck.mp4 --min=5 --max=20
```

Memeriksa resolusi, fps, codec, pixel format, dan tidak adanya audio (gagal = exit 1);
memberi peringatan untuk frame hitam, gambar statis > 2,5 dtk, dan durasi di luar target;
serta membuat `out/<nama>.contact.jpg` (1 frame/detik) untuk menilai komposisi.

## Struktur

```
src/
  config/video.ts          spesifikasi output + area aman Instagram
  theme/                   warna, easing, font (serif judul, sans label, mono data)
  storyboard/
    types.ts               Shot & Production: tujuan naratif, teknik, kamera, durasi, transisi
    timeline.ts            hitung durasi total + validasi storyboard
    ProductionVideo.tsx    merangkai shot dengan transisi
  engine/
    transitions/           kosakata transisi (cut/fade/wipe/slide) dan maknanya
    layers/Finish.tsx      grain film + vignette, pemandu area aman
  productions/
    index.ts               daftar produksi yang terdaftar di Studio
    system-check/          produksi uji pipeline (DOM, 3D, SVG)
scripts/
  qc.mjs                   quality control
  setup-system.sh          dependensi sistem
public/assets/             aset visual (foto arsip, tekstur, peta)
```

### Menambah produksi baru

1. Buat folder `src/productions/<nama>/`, satu file per shot.
2. Tulis `storyboard.ts` berisi `Production` (urutan shot, durasi, transisi, tujuan naratif).
3. Daftarkan di `src/productions/index.ts`. Composition video dan per-shot muncul otomatis.

## Batasan environment (hasil audit)

| Hal | Kondisi | Dampak |
| --- | --- | --- |
| CPU / RAM | 2 vCPU, 7,8 GB, tanpa swap | concurrency render = 2 |
| GPU | tidak ada | WebGL memakai SwiftShader (`swangle`); `angle` gagal |
| Kecepatan | ≈0,5 dtk/frame untuk adegan 3D sederhana | video 3 menit (5.400 frame) ≈ 45–60 menit |
| Transisi shader Remotion | film-burn, cross-zoom, dll. memperlambat seluruh render 10–40× | tidak dipakai; efek dibuat dengan CSS |
| FFmpeg | bawaan Remotion minimal | ffmpeg sistem dipasang untuk QC |

Aturan animasi: semua gerak dihitung dari `useCurrentFrame()`. Jangan pakai CSS
`transition/animation` atau `useFrame()` dari R3F — hasilnya berkedip saat render.
