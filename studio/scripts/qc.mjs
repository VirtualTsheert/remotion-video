#!/usr/bin/env node
// Quality Control untuk video hasil render.
// Pemakaian: node scripts/qc.mjs out/Video.mp4 [--min=60] [--max=180]
//
// Memeriksa spesifikasi teknis (gagal = exit 1) dan memberi peringatan
// editorial: frame hitam, adegan yang membeku terlalu lama, durasi di luar target.
// Juga membuat contact sheet (1 frame/detik) untuk menilai komposisi sekilas.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const minDuration = opt("min", 60);
const maxDuration = opt("max", 180);

if (!file || !existsSync(file)) {
  console.error("Pemakaian: node scripts/qc.mjs <video.mp4> [--min=60] [--max=180]");
  process.exit(2);
}

const EXPECT = { width: 1080, height: 1920, fps: "30/1", codec: "h264", pixFmt: "yuv420p" };

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]).toString(),
);
const video = probe.streams.find((s) => s.codec_type === "video");
const audio = probe.streams.filter((s) => s.codec_type === "audio");
const duration = Number(probe.format.duration);

const errors = [];
const warnings = [];
const check = (ok, msg) => (ok ? null : errors.push(msg));

check(video, "Tidak ada stream video");
if (video) {
  check(video.width === EXPECT.width && video.height === EXPECT.height,
    `Resolusi ${video.width}x${video.height}, seharusnya ${EXPECT.width}x${EXPECT.height}`);
  check(video.r_frame_rate === EXPECT.fps, `Frame rate ${video.r_frame_rate}, seharusnya ${EXPECT.fps}`);
  check(video.codec_name === EXPECT.codec, `Codec ${video.codec_name}, seharusnya ${EXPECT.codec}`);
  check(video.pix_fmt === EXPECT.pixFmt, `Pixel format ${video.pix_fmt}, seharusnya ${EXPECT.pixFmt}`);
}
check(audio.length === 0, `Ada ${audio.length} stream audio, seharusnya tanpa audio`);
if (duration < minDuration || duration > maxDuration) {
  warnings.push(`Durasi ${duration.toFixed(2)} dtk di luar target ${minDuration}–${maxDuration} dtk`);
}

// Deteksi editorial memakai filter FFmpeg; hasilnya ada di stderr.
const analyze = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-nostats", "-i", file, "-vf",
    "blackdetect=d=0.3:pix_th=0.06,freezedetect=n=0.002:d=2.5", "-an", "-f", "null", "-"],
  { encoding: "utf8" },
).stderr;

for (const m of analyze.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)) {
  warnings.push(`Frame hitam ${m[1]}–${m[2]} dtk`);
}
for (const m of analyze.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)) {
  warnings.push(`Gambar statis ${Number(m[2]).toFixed(1)} dtk mulai ${Number(m[1]).toFixed(1)} dtk — pertimbangkan gerak kamera/animasi`);
}

// Contact sheet: 1 frame per detik, 6 kolom, diperkecil.
const sheet = path.join(path.dirname(file), `${path.basename(file, path.extname(file))}.contact.jpg`);
const rows = Math.max(1, Math.ceil(Math.ceil(duration) / 6));
spawnSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", file, "-vf",
  `fps=1,scale=270:-1,tile=6x${rows}:padding=6:color=black`, "-frames:v", "1", "-q:v", "3", sheet]);

const sizeMb = statSync(file).size / 1024 / 1024;
console.log(`\nQC: ${file}`);
console.log(`  ${video?.width}x${video?.height} @ ${video?.r_frame_rate} · ${video?.codec_name}/${video?.pix_fmt}` +
  ` · ${duration.toFixed(2)} dtk · ${sizeMb.toFixed(1)} MB · audio: ${audio.length ? "ADA" : "tidak ada"}`);
console.log(`  Contact sheet: ${sheet}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✖ ${e}`);
console.log(errors.length ? "\nGAGAL\n" : "\nLULUS (spesifikasi teknis)\n");
process.exit(errors.length ? 1 : 0);
