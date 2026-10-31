/**
 * Konfigurasi ini berlaku untuk `npx remotion studio|render|still`.
 * Saat memakai Node.js API, opsi harus diberikan langsung ke API.
 *
 * Semua opsi: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Codespace tidak punya GPU: "angle" gagal membuat konteks WebGL,
// "swangle" (SwiftShader, WebGL via CPU) terbukti berjalan untuk Three.js.
Config.setChromiumOpenGlRenderer("swangle");

// Output untuk Instagram Reels: H.264, yuv420p, tanpa track audio.
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
// Ruang warna ditandai eksplisit (lihat scripts/plates.mjs).
Config.setColorSpace("bt709");
Config.setCrf(18);
Config.setMuted(true);

// 2 vCPU / ~8 GB RAM: dua tab render paralel adalah batas aman.
Config.setConcurrency(2);
