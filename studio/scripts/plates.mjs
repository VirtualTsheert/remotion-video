#!/usr/bin/env node
// Cache "plate": shot yang ditandai `plate: true` di storyboard dirender sekali
// menjadi video berkualitas tinggi di public/plates/, lalu render final memakai
// video itu alih-alih menghitung ulang adegan 3D yang mahal.
//
// Pemakaian:
//   node scripts/plates.mjs <ProductionId>           # buat plate yang belum ada / usang
//   node scripts/plates.mjs <ProductionId> --check   # hanya laporkan status
//   node scripts/plates.mjs <ProductionId> --force   # render ulang semua plate
//
// Plate dianggap USANG bila isi src/, public/ (kecuali plates/) atau
// package-lock.json berubah sejak plate dibuat. Pendekatan ini konservatif:
// perubahan kode apa pun memicu render ulang plate saat skrip dijalankan.

import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderMedia } from "@remotion/renderer";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const productionId = args.find((a) => !a.startsWith("--"));
const check = args.includes("--check");
const force = args.includes("--force");
if (!productionId) {
  console.error("Pemakaian: node scripts/plates.mjs <ProductionId> [--check|--force]");
  process.exit(2);
}

const PLATES = path.resolve("public/plates");
const MANIFEST = path.join(PLATES, "manifest.json");
mkdirSync(PLATES, { recursive: true });

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (p === PLATES) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const sourceHash = () => {
  const h = createHash("sha256");
  for (const file of [...walk(path.resolve("src")), ...walk(path.resolve("public")), path.resolve("package-lock.json")].sort()) {
    h.update(path.relative(process.cwd(), file));
    h.update(readFileSync(file));
  }
  return h.digest("hex").slice(0, 16);
};

const hash = sourceHash();
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const chromiumOptions = { gl: "swangle" };

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { chromiumOptions });
const shots = (await getCompositions(serveUrl, { chromiumOptions, puppeteerInstance: browser })).filter(
  (c) => c.id.startsWith(`${productionId}-`) && c.props.plate === true,
);

if (shots.length === 0) console.log(`Tidak ada shot ber-plate di produksi "${productionId}".`);

for (const composition of shots) {
  const file = path.join(PLATES, `${composition.id}.mp4`);
  const fresh = existsSync(file) && manifest[composition.id]?.hash === hash;
  const status = !existsSync(file) ? "belum ada" : fresh ? "terbaru" : "usang";
  if (check || (fresh && !force)) {
    console.log(`  ${composition.id}: ${status}`);
    continue;
  }
  console.log(`  ${composition.id}: ${status} → render ${composition.durationInFrames} frame…`);
  const started = Date.now();
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    // Kualitas tinggi: plate akan dikompres sekali lagi pada render final.
    crf: 10,
    pixelFormat: "yuv420p",
    // Tandai ruang warna secara eksplisit: tanpa tag, Chrome salah menebak saat
    // memutar plate di render final dan warna bergeser (terukur: merah 135→147).
    colorSpace: "bt709",
    muted: true,
    concurrency: 2,
    outputLocation: file,
    chromiumOptions,
    puppeteerInstance: browser,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) {
        last = pct;
        process.stdout.write(` ${pct}%`);
      }
    },
  });
  const secs = (Date.now() - started) / 1000;
  console.log(`\n  ${composition.id}: selesai dalam ${secs.toFixed(0)} dtk (${((secs * 1000) / composition.durationInFrames).toFixed(0)} ms/frame)`);
  manifest[composition.id] = { hash, renderedAt: new Date().toISOString(), frames: composition.durationInFrames };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

await browser.close({ silent: true });
