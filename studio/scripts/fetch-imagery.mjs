#!/usr/bin/env node
// Mengunduh citra satelit dari NASA GIBS (WMS) berdasarkan manifest riset,
// sehingga setiap citra di video bisa ditelusuri ulang: lapisan, tanggal, bbox.
//
// Pemakaian: node scripts/fetch-imagery.mjs research/<produksi>/imagery.json [--force]
// Hasil: <outDir>/<id>.jpg + <outDir>/manifest.json (salinan metadata untuk komponen).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [manifestPath] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const force = process.argv.includes("--force");
if (!manifestPath) {
  console.error("Pemakaian: node scripts/fetch-imagery.mjs research/<produksi>/imagery.json [--force]");
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const outDir = path.resolve(manifest.outDir);
mkdirSync(outDir, { recursive: true });

const WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";

for (const img of manifest.images) {
  const file = path.join(outDir, `${img.id}.jpg`);
  if (existsSync(file) && !force) {
    console.log(`  ${img.id}: sudah ada`);
    continue;
  }
  const [w, s, e, n] = img.bbox;
  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: img.layer,
    STYLES: "",
    SRS: "EPSG:4326",
    BBOX: `${w},${s},${e},${n}`,
    WIDTH: String(img.size[0]),
    HEIGHT: String(img.size[1]),
    FORMAT: "image/jpeg",
    TIME: img.time,
  });
  const res = await fetch(`${WMS}?${params}`);
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.startsWith("image/")) {
    throw new Error(`${img.id}: gagal (${res.status} ${type}) — ${(await res.text()).slice(0, 200)}`);
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`  ${img.id}: ${img.layer} @ ${img.time} → ${path.relative(process.cwd(), file)}`);
}

writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ credit: manifest.credit, images: manifest.images }, null, 2),
);
console.log("Selesai. Atribusi: " + manifest.credit);
