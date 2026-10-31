#!/usr/bin/env node
// Audio PLACEHOLDER untuk "Kucing — 10 Tahun untuk Tidur", disintesis murni dari
// kode (tanpa sampel/aset berlisensi). Ganti dengan rekaman/musik asli kapan saja
// dengan menimpa file bernama sama di public/audio/kucing/.
//
//   node scripts/synth-kucing-audio.mts
//
// Menghasilkan: background-music.mp3, ambient-room.wav, cat-breathing.wav,
// clock-ticking.wav, transition-whoosh.wav.
// TIDAK menghasilkan voiceover.wav — voice-over harus direkam manusia / TTS
// berkualitas; naskah & waktunya ada di src/productions/kucing/data/script.ts.

import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const SR = 44100;
const OUT = path.resolve("public/audio/kucing");
mkdirSync(OUT, { recursive: true });

let seed = 20261031;
const noise = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};
const midi = (m: number) => 440 * 2 ** ((m - 69) / 12);

const writeWav = (file: string, buf: Float32Array, gain = 1) => {
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const k = peak > 0 ? (0.89 / peak) * gain : 0;
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] * k)) * 32767), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path.join(OUT, file), Buffer.concat([h, data]));
  console.log(`  ${file}  ${(buf.length / SR).toFixed(1)} dtk`);
};

// Reverb Schroeder sederhana (4 comb + 2 allpass), wet/dry.
const reverb = (x: Float32Array, wet = 0.3, size = 1) => {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * size));
  const y = new Float32Array(x.length);
  for (const d of combs) {
    const b = new Float32Array(d);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < x.length; i++) {
      const out = b[idx];
      lp = out * 0.6 + lp * 0.4;
      b[idx] = x[i] + lp * 0.8;
      idx = (idx + 1) % d;
      y[i] += out / combs.length;
    }
  }
  for (const d of [225, 556]) {
    const b = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < y.length; i++) {
      const bo = b[idx];
      const v = y[i] + bo * 0.5;
      b[idx] = v;
      y[i] = bo - v * 0.5;
      idx = (idx + 1) % d;
    }
  }
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * (1 - wet) + y[i] * wet * 3;
  return out;
};

// ------------------------------------------------------------------ musik
const music = () => {
  const DUR = 88;
  const N = DUR * SR;
  const buf = new Float32Array(N);
  const add = (t0: number, dur: number, f: number, g: number, att: number, decay: number, partials: [number, number][]) => {
    const s0 = Math.max(0, Math.round(t0 * SR));
    const s1 = Math.min(N, Math.round((t0 + dur) * SR));
    for (const [mult, amp] of partials) {
      const w = (2 * Math.PI * f * mult) / SR;
      for (let i = s0; i < s1; i++) {
        const t = (i - s0) / SR;
        const env = Math.min(1, t / att) * Math.exp(-t / (decay / Math.sqrt(mult))) * Math.min(1, (t0 + dur - i / SR) / 0.3);
        buf[i] += Math.sin(w * (i - s0)) * g * amp * env;
      }
    }
  };
  const PIANO: [number, number][] = [[1, 1], [2, 0.45], [3, 0.18], [4, 0.08], [5.02, 0.04]];
  const piano = (t: number, m: number, g: number, len = 3.5) => add(t, len, midi(m), g, 0.006, 1.6, PIANO);
  const pad = (t: number, m: number, g: number, len: number) => {
    add(t, len, midi(m), g, 1.8, 60, [[1, 1], [2, 0.2]]);
    add(t, len, midi(m) * 1.003, g * 0.7, 2.2, 60, [[1, 1]]);
  };
  // D mayor, 70 bpm. Progresi: Dmaj7 – Bm7 – Gmaj7 – Asus4/A
  const BAR = (60 / 70) * 4;
  const CH = [
    { root: 50, tones: [62, 66, 69, 73] },
    { root: 47, tones: [59, 62, 66, 69] },
    { root: 43, tones: [55, 59, 62, 66] },
    { root: 45, tones: [57, 62, 64, 69] },
  ];
  // Bagian mengikuti data/scenes.ts: intro 0–12, waktu 12–31, angka 31–53,5,
  // manusia 53,5–79 (lebih ringan & ceria), penutup 79–88.
  const sectionGain = (t: number) => {
    if (t < 12) return 0.6;
    if (t < 53.5) return 0.75;
    if (t < 79) return 0.9;
    return Math.max(0, 0.95 * (1 - (t - 82) / 6));
  };
  const melody = [74, 73, 71, 69, 71, 73, 74, 76, 78, 76, 74, 73, 71, 69, 66, 69];
  for (let bar = 0, t = 0; t < DUR - 2; bar++, t += BAR) {
    const ch = CH[bar % 4];
    const g = sectionGain(t);
    pad(t, ch.root, 0.05 * g, BAR + 1.5);
    for (const m of ch.tones) pad(t, m - 12, 0.018 * g, BAR + 1.5);
    if (t >= 10) {
      // arpeggio piano lembut (seperdelapan)
      const step = BAR / 8;
      const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
      for (let k = 0; k < 8; k++) {
        if (t < 31 && k % 2 === 1) continue; // awal lebih jarang
        piano(t + k * step, ch.tones[pattern[k]], 0.05 * g * (k === 0 ? 1.3 : 1));
      }
    }
    if (t >= 53 && t < 79) {
      // perbandingan manusia: melodi ringan staccato, oktaf atas
      const mi = bar % melody.length;
      for (let k = 0; k < 4; k++) piano(t + (k * BAR) / 4, melody[(mi + k) % melody.length] + 12, 0.045 * g, 0.9);
    }
    if (t >= 79) {
      piano(t, ch.root, 0.06 * g, 4.5);
      piano(t + 0.02, ch.root + 12, 0.045 * g, 4.5);
    }
  }
  // akor penutup (Dmaj9), tepat di "jangan sia-siakan waktumu"
  for (const [dt, m] of [[0, 50], [0.05, 62], [0.1, 66], [0.15, 69], [0.22, 76]] as [number, number][]) piano(80.3 + dt, m, 0.06, 6);
  const wet = reverb(buf, 0.35, 1.2);
  // fade out total
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    wet[i] *= Math.min(1, t / 3) * Math.min(1, (DUR - t) / 4);
  }
  writeWav("background-music.wav", wet, 1);
  const wav = path.join(OUT, "background-music.wav");
  const mp3 = path.join(OUT, "background-music.mp3");
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "192k", mp3]);
  if (r.status === 0) {
    rmSync(wav);
    console.log("  → background-music.mp3");
  } else {
    console.warn("  ffmpeg gagal; background-music.wav dibiarkan (ubah nama file di data/audio.ts)");
  }
};

// ------------------------------------------------------------------ SFX
const loopFade = (buf: Float32Array, sec = 0.4) => {
  // crossfade ujung → awal agar loop tanpa klik
  const n = Math.round(sec * SR);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    buf[i] = buf[i] * k + buf[buf.length - n + i] * (1 - k);
  }
  return buf.slice(0, buf.length - n);
};

const ambient = () => {
  const N = 20 * SR;
  const b = new Float32Array(N);
  let brown = 0;
  let lp = 0;
  for (let i = 0; i < N; i++) {
    brown = (brown + noise() * 0.02) * 0.995;
    lp += (noise() - lp) * 0.02;
    b[i] = brown * 0.8 + lp * 0.15;
  }
  // kicau burung samar di kejauhan
  for (const t0 of [3.2, 3.5, 11.8, 12.1, 16.4]) {
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < 0.12 * SR; i++) {
      const t = i / SR;
      b[s0 + i] += Math.sin(2 * Math.PI * (3200 + 1800 * Math.sin(t * 60)) * t) * 0.01 * Math.sin((Math.PI * t) / 0.12);
    }
  }
  writeWav("ambient-room.wav", loopFade(b, 1), 0.6);
};

const breathing = () => {
  const P = 2.9; // detik per napas
  const N = Math.round(P * 3 * SR);
  const b = new Float32Array(N);
  let bp1 = 0;
  let bp2 = 0;
  let purrLp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const ph = (t % P) / P;
    const inhale = ph < 0.4 ? Math.sin((ph / 0.4) * Math.PI) : 0;
    const exhale = ph >= 0.4 ? Math.sin(((ph - 0.4) / 0.6) * Math.PI) : 0;
    const n = noise();
    bp1 += (n - bp1) * 0.08;
    bp2 += (bp1 - bp2) * 0.08;
    const air = (bp1 - bp2) * (inhale * 0.7 + exhale * 0.9);
    // dengkur: noise rendah dimodulasi ~26 Hz saat menghembus
    purrLp += (noise() - purrLp) * 0.01;
    const purr = purrLp * (0.5 + 0.5 * Math.sin(2 * Math.PI * 26 * t)) * exhale * 2.2;
    b[i] = air + purr;
  }
  writeWav("cat-breathing.wav", b, 0.7);
};

const clock = () => {
  const N = 2 * SR;
  const b = new Float32Array(N);
  const click = (t0: number, f: number, g: number) => {
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < 0.04 * SR; i++) {
      const t = i / SR;
      b[s0 + i] += (Math.sin(2 * Math.PI * f * t) * 0.7 + noise() * 0.3) * g * Math.exp(-t / 0.006);
    }
  };
  click(0.05, 3100, 1);
  click(1.05, 2300, 0.8);
  writeWav("clock-ticking.wav", b, 0.8);
};

const whoosh = () => {
  const D = 1.4;
  const N = Math.round(D * SR);
  const b = new Float32Array(N);
  let low = 0;
  let band = 0;
  for (let i = 0; i < N; i++) {
    const u = i / N;
    const fc = 300 + 2600 * Math.sin(u * Math.PI) ** 2;
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const q = 0.35;
    const x = noise();
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    b[i] = band * Math.sin(u * Math.PI) ** 1.6;
  }
  writeWav("transition-whoosh.wav", reverb(b, 0.25, 0.7), 0.8);
};

console.log("Sintesis audio placeholder → public/audio/kucing/");
music();
ambient();
breathing();
clock();
whoosh();
if (!existsSync(path.join(OUT, "voiceover.wav"))) {
  console.log("  (voiceover.wav belum ada — rekam sesuai src/productions/kucing/data/script.ts)");
}
