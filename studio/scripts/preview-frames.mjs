#!/usr/bin/env node
// Preview cepat tanpa render video: beberapa frame dirender sebagai still lalu
// disusun menjadi satu contact sheet. Satu kali bundle, satu browser.
//
// Pemakaian:
//   node scripts/preview-frames.mjs <CompositionId> [--n=6] [--frames=0,45,90] [--scale=0.4] [--clean] [--props='{"quality3d":0.5}']
//
// Secara default berjalan dalam mode debug (area aman + peringatan tepi tampil);
// --clean untuk melihat frame persis seperti render final.
// Hasil: out/preview/<CompositionId>.jpg (urutan kiri→kanan, atas→bawah = urutan frame).

import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
if (!id) {
  console.error("Pemakaian: node scripts/preview-frames.mjs <CompositionId> [--n=6] [--frames=0,45,90] [--scale=0.4]");
  process.exit(2);
}

const scale = Number(opt("scale") ?? 0.4);
// Sama dengan remotion.config.ts (Node API tidak membaca file config).
const chromiumOptions = { gl: "swangle" };
const extraProps = opt("props") ? JSON.parse(args.find((a) => a.startsWith("--props=")).slice(8)) : {};
const inputProps = { ...(args.includes("--clean") ? {} : { debug: true }), ...extraProps };

const started = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl, id, inputProps, chromiumOptions, puppeteerInstance: browser });

const n = Number(opt("n") ?? 6);
const last = composition.durationInFrames - 1;
const frames = opt("frames")
  ? opt("frames").split(",").map(Number)
  : Array.from({ length: n }, (_, i) => Math.round((last * i) / Math.max(1, n - 1)));

const dir = path.resolve("out/preview", `${id}-frames`);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

for (const [i, frame] of frames.entries()) {
  const t = Date.now();
  await renderStill({
    serveUrl,
    composition,
    inputProps,
    frame,
    output: path.join(dir, `${String(i).padStart(3, "0")}.jpg`),
    imageFormat: "jpeg",
    jpegQuality: 85,
    scale,
    chromiumOptions,
    puppeteerInstance: browser,
  });
  console.log(`  frame ${frame} · ${Date.now() - t} ms`);
}
await browser.close({ silent: true });

const cols = Math.min(frames.length, 6);
const rows = Math.ceil(frames.length / cols);
const sheet = path.resolve("out/preview", `${id}.jpg`);
spawnSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", path.join(dir, "%03d.jpg"),
  "-vf", `tile=${cols}x${rows}:padding=6:color=black`, "-frames:v", "1", "-q:v", "3", sheet]);

console.log(`${id}: frame [${frames.join(", ")}] → ${path.relative(process.cwd(), sheet)} (${((Date.now() - started) / 1000).toFixed(1)} dtk)`);
