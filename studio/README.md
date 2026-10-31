# Cinematic Investigative Documentary Studio

Studio produksi video dokumenter investigatif untuk Instagram Reels, dibangun dengan
Remotion + React, Three.js (React Three Fiber), dan SVG/CSS.

**Spesifikasi output:** 1080×1920 (9:16) · 30 fps · H.264 yuv420p BT.709 · tanpa audio · tanpa subtitle.
Voice-over ditambahkan terpisah setelah render.

Progres pembangunan: lihat [PROGRESS.md](PROGRESS.md).

## Persiapan (sekali per Codespace)

```bash
cd studio
bash scripts/setup-system.sh   # library Chrome headless + ffmpeg (ulang setelah rebuild Codespace)
npm install
# Aset cache (sudah ter-commit; jalankan ulang hanya bila ingin membuat ulang):
bash scripts/build-textures.sh       # grain film + serat kertas
node scripts/build-geo.mjs           # data peta Natural Earth
python3 scripts/build-lab-assets.py  # aset uji lab
```

## Alur kerja

| Langkah | Perintah | Kegunaan |
| --- | --- | --- |
| Edit interaktif | `npm run dev` | Remotion Studio di port 3000 (tab **Ports** → globe). Memakai GPU browser Anda. |
| Cek cepat beberapa frame | `npm run preview -- Lab-Desk` | Contact sheet `out/preview/<id>.jpg`, ±1 dtk/frame, tanpa render video |
| Cek pacing | `npm run render:draft -- Lab` | Video setengah resolusi, 3D resolusi rendah |
| Cache shot berat | `npm run plates -- Lab` | Render shot `plate: true` sekali; hanya diulang bila kode berubah |
| Render final | `npm run render -- Lab` | `out/Lab.mp4` |
| Quality control | `npm run qc -- out/Lab.mp4` | Spesifikasi teknis + peringatan editorial + contact sheet |

Opsi `preview`: `--n=6` (jumlah frame merata), `--frames=0,45,90`, `--scale=0.4`,
`--clean` (tanpa pemandu debug), `--props='{"quality3d":0.5}'`.

Mode debug (Studio dan `preview`) menampilkan pemandu yang **tidak pernah** ikut render final:
garis area aman (hijau putus-putus), peringatan tepi foto parallax (merah), dan badge `PLATE`.

Satu shot saja: `npm run render -- Lab-City3D`. Rentang frame: `npx remotion render Lab out/x.mp4 --frames=60-90`.
Unduh hasil: klik kanan file di Explorer VS Code → **Download**.

## Visual Engine

Semua komponen dapat diuji satu per satu di produksi **Lab** (`src/lab/`).

| Sistem | Komponen | File |
| --- | --- | --- |
| Kamera 2D | `Camera2D`, `Layer` (kedalaman), `At`, `key()`, `focusOn()`, handheld | `engine/camera/Camera2D.tsx` |
| Kamera 3D | `CameraRig3D`, `key3d()`, `orbit()` (spiral), `cameraStateAt()` | `engine/camera/CameraRig3D.tsx` |
| Track | `sampleTrack` (keyframe generik, zoom di ruang log) | `engine/camera/track.ts` |
| Parallax 2.5D | `ParallaxScene` (lapisan, debu, kabut, perlakuan arsip, peringatan tepi) | `engine/parallax/` |
| Objek | `Place` (mendarat di meja), `Paper`, `TypedDocument`, `PhotoPrint`, `Newspaper` | `engine/objects/` |
| Penanda | `Highlight`, `Redact`, `CircleMark`, `Stamp`, `Typewriter` | `engine/objects/Marks.tsx` |
| Peta | `GeoMap`, `GeoRoute`, `MapPin`, `MapLabel`, `geo([lon, lat])` | `engine/graphics/GeoMap.tsx` |
| Data | `Chronology` + `chronologyCamera()`, `Network` (terdokumentasi vs dugaan), `Counter` | `engine/graphics/` |
| 3D | `Stage3D` (resolusi adaptif), `CityModel` (instanced, x-ray penghalang) | `engine/three/` |
| Transisi | `cut`, `fade`, `wipe`, `slide`, `dip`, `light-leak`, `push-in` | `engine/transitions/` |
| Finishing | `Finish` (grain + vignette), `SafeAreaGuide` | `engine/layers/Finish.tsx` |
| Aset | `asset("id")` + registry sumber & lisensi | `assets/registry.ts` |

### Prinsip kamera

Keyframe kamera 2D menyatakan **titik dunia yang dilihat** dan seberapa dekat:

```tsx
<Camera2D keys={[key(0, [1100, 1650], 0.52), key(105, [760, 1230], 1.05)]} handheld={{ amount: 5 }}>
  <Layer depth={0.3}>{/* latar jauh */}</Layer>
  <Layer>{/* bidang utama, koordinat dunia */}</Layer>
</Camera2D>
```

- Peta: `key(60, geo([106.8, -6.2]), 4)` — kamera menuju Jakarta.
- Parallax: `focusOn(titik, depth, anchor)` — memusatkan subjek yang berada di lapisan selain depth 1.
- 3D: `CityModel subject={...} cameraPath={path}` — gedung yang menghalangi pandangan memudar otomatis.

### Kosakata transisi

| Transisi | Makna |
| --- | --- |
| `cut` | kesinambungan langsung |
| `fade` | perpindahan waktu/lokasi yang tenang |
| `wipe` | membuka bab/bukti baru |
| `slide` | dokumen/data berikutnya |
| `dip` | jeda waktu jelas, pergantian bab |
| `light-leak` | lompat ke materi arsip / masa lalu |
| `push-in` | masuk lebih dalam ke detail |

## Struktur

```
src/
  config/video.ts          spesifikasi output, area aman, isDebug()
  theme/                   warna, easing, font (serif, sans, mono, mesin tik, tulisan tangan)
  storyboard/              tipe Shot/Production, durasi & validasi, ProductionVideo (+plate)
  engine/                  Visual Engine (tabel di atas)
  assets/registry.ts       Asset Library
  lab/                     produksi uji: satu shot per kemampuan engine
  productions/             produksi (index.ts = daftar yang tampil di Studio)
scripts/
  preview-frames.mjs       contact sheet cepat
  plates.mjs               cache shot berat
  qc.mjs                   quality control
  build-*.{sh,mjs,py}      pembuat aset cache
  setup-system.sh          dependensi sistem
public/
  textures/ geo/ lab/      aset cache (ter-commit)
  plates/                  cache plate (tidak di-commit)
```

### Menambah produksi baru

1. Buat folder `src/productions/<nama>/`, satu file per shot.
2. Daftarkan aset baru di `src/assets/registry.ts` beserta sumber & lisensinya.
3. Tulis `storyboard.ts` berisi `Production` (urutan shot, tujuan naratif, kamera, durasi, transisi, sumber).
4. Daftarkan di `src/productions/index.ts`. Composition video dan per-shot muncul otomatis.

## Batasan environment & performa (terukur)

| Hal | Kondisi | Keputusan |
| --- | --- | --- |
| CPU / RAM | 2 vCPU, 7,8 GB, tanpa swap | concurrency render = 2 |
| GPU | tidak ada | WebGL via SwiftShader (`swangle`); `angle` gagal |
| Biaya dasar per frame | ±0,35–0,45 dtk (screenshot 1080×1920) | tidak bisa ditekan dari sisi adegan |
| 3D | ±0,9 dtk/frame (kota, MSAA, resolusi 0,75) | plate cache; MSAA tetap aktif (mematikannya hanya −10%, tepi bergerigi) |
| Transisi shader Remotion | memperlambat seluruh render 10–40× | diganti `dip`, `light-leak`, `push-in` (CSS) |
| `background-image` CSS | tidak ditunggu saat render → berkedip | semua tekstur memakai `<Img>` |
| Ruang warna video | tanpa tag, plate bergeser warna di Chrome | semua output BT.709 |
| FFmpeg bawaan Remotion | minimal | ffmpeg sistem untuk QC |

Aturan animasi: semua gerak dihitung dari `useCurrentFrame()`. Jangan pakai CSS
`transition/animation` atau `useFrame()` dari R3F — hasilnya berkedip saat render.
