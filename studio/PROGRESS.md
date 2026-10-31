# Progres Pembangunan

## Tahap 1 — Environment Audit ✅ (2026-10-31)

- Codespace Ubuntu 24.04, 2 vCPU, 7,8 GB RAM, tanpa swap, tanpa GPU. Node 24, npm 11.
- Remotion bisa preview dan render setelah library Chrome headless dipasang (`scripts/setup-system.sh`).
- Three.js hanya jalan dengan WebGL CPU (`swangle`); `angle` gagal.
- Transisi shader `@remotion/transitions` (film-burn, cross-zoom, …) memperlambat render 10–40× → tidak dipakai.
- FFmpeg bawaan Remotion minimal → ffmpeg sistem dipasang untuk QC.

## Tahap 2 — Project Foundation ✅ (2026-10-31)

- Storyboard berbentuk data (`Production`/`Shot`) → composition video lengkap + per-shot dibuat otomatis.
- Validasi storyboard, perhitungan durasi dengan transisi, kosakata transisi CSS.
- Finishing: grain film + vignette; pemandu area aman (khusus Studio).
- QC: spesifikasi teknis, frame hitam, gambar statis, contact sheet.
- Produksi uji `SystemCheck` (DOM, 3D, SVG): 265 frame dirender dalam 153 dtk, QC lulus.

## Tahap 3 — Visual Engine ✅ (2026-10-31)

Setiap kemampuan punya shot uji sendiri di produksi **Lab** (`src/lab/`), bisa dipreview
satu per satu (`npm run preview -- Lab-<Shot>`). Render penuh Lab: 1.220 frame (40,7 dtk)
dalam 577 dtk ≈ 0,47 dtk/frame, QC lulus.

| Sistem | Hasil | Shot uji |
| --- | --- | --- |
| Camera 2D | keyframe berbasis titik fokus, zoom ruang-log, handheld deterministik, lapisan berkedalaman | Lab-Desk |
| Animasi objek | dokumen/foto/koran mendarat fisik (`Place`), mesin tik, stabilo, lingkaran spidol, stempel, sensor | Lab-Desk |
| Parallax 2.5D | lapisan foto + debu + kabut + perlakuan arsip; `focusOn` untuk subjek di lapisan mana pun; peringatan tepi foto | Lab-Parallax |
| Peta | Natural Earth 1:10m, kamera dalam derajat (`geo()`), rute, pin & label berukuran konstan | Lab-Map |
| Kronologi | garis waktu + kamera otomatis per peristiwa | Lab-Chronology |
| Jaringan aktor | hubungan terdokumentasi (utuh) vs dugaan (putus-putus), penghitung angka | Lab-Network |
| 3D ringan | maket kota instanced; gedung penghalang otomatis transparan (memudar) | Lab-City3D |
| Transisi | `dip`, `light-leak`, `push-in` (CSS) + `fade`, `wipe`, `slide` | antarshot Lab |
| Asset Library | registry aset + sumber + lisensi, `asset("id")`, `credits()` | — |

Optimasi rendering:

- `npm run preview`: contact sheet beberapa frame (satu bundle, satu browser) ±1 dtk/frame.
- `npm run render:draft`: setengah resolusi, 3D `quality3d: 0.5`.
- Cache plate (`npm run plates`): shot 3D dirender sekali; diulang hanya bila kode berubah (hash).
  Terukur: 120 frame City3D 103 → 61 dtk.
- Tekstur grain & kertas dibuat sekali (gambar), bukan noise per frame.
- Data peta diproses sekali (dipotong wilayah, koordinat dibulatkan).

Masalah yang ditemukan & diperbaiki selama pengujian:

- `background-image` CSS tidak ditunggu saat render → diganti `<Img>`.
- Plate bergeser warna di render final (merah 135→147) → semua output ditandai BT.709.
- Kamera parallax memotong subjek → `focusOn()`; tepi foto terlihat → peringatan otomatis.
- Gedung menutupi sasaran 3D → x-ray otomatis yang memudar (bukan berkedip).
- Kamera kronologi melompat 1 frame & layar kosong 0,7 dtk (tertangkap QC) → diperbaiki.
- Teks dokumen saat close-up < 44 px di layar → ukuran font dinaikkan.

Belum dikerjakan / batasan yang diketahui:

- Parallax foto asli butuh potongan lapisan (PNG transparan). Belum ada alat pemotong
  otomatis di repo; opsi berbasis kode (model segmentasi di Node) bisa dievaluasi bila perlu.
- 3D baru berupa maket kota; interior/ruangan dibuat sesuai kebutuhan pilot.
- Peta adalah shot DOM terberat (±2 dtk/frame di preview) karena detail 1:10m tetap digambar
  saat tampilan lebar; versi detail rendah untuk tampilan lebar bisa ditambahkan bila perlu.

## Tahap 4 — Pilot Video ⏳

Belum dimulai. Butuh keputusan topik sejarah dan sumber materi yang dapat dipertanggungjawabkan.
