# Kucing — "Kucingmu Menghabiskan 10 Tahun untuk Tidur"

Video fakta 2.5D vertikal (1080×1920, 30 fps, 88 dtk). Semua visual dibuat
dengan kode (SVG berlapis + React + Remotion). Tidak ada gambar/video dari luar.

## Struktur

```
kucing/
  components/
    CatCharacter.tsx   karakter lengkap: menyusun bagian tubuh + gerak hidup
    CatBody.tsx        rig (bahu, pinggul, IK kaki depan/belakang), badan, leher, kaki
    CatFace.tsx        kepala 3/4: mata (pupil, highlight, kedip), telinga, mulut menguap, kumis
    CatTail.tsx        ekor 13 ruas dengan gelombang merambat & menyusuri lantai
    CatAnimation.ts    pose (stand, walk, sit, loaf, curl, stretch, crouch, eat),
                       poseTrack (keyframe), napas, kedip, kedutan telinga, siklus jalan
    CatLab.tsx         lembar uji semua pose (composition "KucingLab-Pose")
    Environment.tsx    ruang tamu tunggal (luar jendela, dinding, perabot) = ParallaxEnvironment
    Camera.tsx         CinematicCamera + ParallaxLayer (dolly, pan, tracking, DOF, motion blur)
    Lighting.tsx       waktu dalam sehari, sinar jendela, god rays, lampu, grading
    Particles.tsx      debu melayang (DustParticles)
    Typography.tsx     AnimatedTypography, penghitung angka, subtitle VO
    Timeline.tsx       jam 24 jam, cincin tidur/terjaga, TimelineVisualization 15 tahun
    AudioManager.tsx   pemutar semua track dari data/audio.ts
    SceneTransition.tsx Fade, LightBloom, IrisMask
  scenes/
    Scene01Hook.tsx  Scene02SleepingFacts.tsx  Scene03Lifetime.tsx
    Scene04Human.tsx (perbandingan manusia, grid 75 tahun)  Scene05Ending.tsx
  data/
    scenes.ts   durasi adegan (sumber kebenaran waktu)
    script.ts   naskah VO + waktu, angka (dihitung, bukan diketik), isyarat visual
    audio.ts    volume & rentang setiap track
  storyboard.tsx  mendaftarkan produksi "Kucing" (+ overlay audio & subtitle)
  lab.tsx         produksi uji "KucingLab"
```

Project ini memakai TypeScript (`.tsx`), jadi nama file mengikuti konvensi itu
(bukan `.jsx`); `Root`/`index` sudah ada di `src/` dan otomatis memuat produksi ini.

## Angka

| | Rumus | Hasil |
|---|---|---|
| 12 jam/hari | 12/24 × 15 tahun | 7,5 tahun tidur · 7,5 tahun terjaga |
| 16 jam/hari | 16/24 × 15 tahun | 10 tahun tidur · 5 tahun terjaga |
| 16 jam/hari | 16/24 | tepat 2/3 hidup |
| Manusia 75 thn | UHH Indonesia 2025 = 74,47 (BPS), dibulatkan | |
| Tidur 8 jam/hari | 75 × 8/24 | 25 tahun |
| HP 6 jam/hari, usia 15–75 | 60 × 6/24 (data.ai: 6,05 jam/hari) | 15 tahun |
| Kerja 40 jam/mgg, 50 mgg/thn, usia 22–58 | 72.000 jam ÷ 8.760 | ≈ 8 tahun |
| Sisanya | 75 − 25 − 15 − 8 | 27 tahun |

Angka manusia adalah estimasi kasar (aktivitas bisa tumpang tindih, mis. main HP saat kerja);
di layar diberi catatan "estimasi kasar".

## Audio (`public/audio/kucing/`)

| File | Status |
|---|---|
| `voiceover.wav` | **belum ada** — rekam sesuai `data/script.ts` |
| `background-music.mp3` | placeholder sintesis (`npm run audio:kucing`) |
| `ambient-room.wav`, `cat-breathing.wav`, `clock-ticking.wav`, `transition-whoosh.wav` | placeholder sintesis |

Placeholder dibuat oleh `scripts/synth-kucing-audio.mts` (piano + pad + reverb,
noise berfilter untuk SFX). Ganti dengan file asli bernama sama kapan saja.
Track yang filenya tidak ada dilewati otomatis.

**Memasukkan voice-over:**
1. Rekam satu file `voiceover.wav` sepanjang film (88 dtk), mulai detik 0, mengikuti
   waktu tiap kalimat di `data/script.ts` (`VO[].from/to`).
2. Upload ke `studio/public/audio/kucing/voiceover.wav` (drag-and-drop ke Explorer VS Code).
3. Buka Studio, dengarkan. Jika ada kalimat meleset, geser `from/to` di `script.ts`
   dan angka/teks layar di `CUES` — subtitle & ducking musik mengikuti otomatis.
4. Volume tiap track diatur di `data/audio.ts`.

## Perintah (dari folder `studio/`)

```
npm run dev                  # Studio → composition "Kucing" (atau per adegan: folder Kucing-Shots)
npm run audio:kucing         # buat ulang audio placeholder
npm run render:kucing        # render final + audio → out/Kucing.mp4
npm run render:kucing:draft  # setengah resolusi, cepat
node scripts/preview-frames.mjs Kucing --n=8 --clean   # contact sheet cepat
```

Subtitle dapat dimatikan: `npx remotion render Kucing out/x.mp4 --props='{"captions":false}'`
(dengan `REMOTION_WITH_AUDIO=1` di depannya agar audio ikut).
