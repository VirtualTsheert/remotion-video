#!/usr/bin/env node
// Soundtrack "1 Sendok = Seumur Hidup 12 Lebah" disintesis dari kode (tanpa aset
// berlisensi): musik 4 babak + SFX, dengan waktu yang dibaca langsung dari data episode.
//
//   node scripts/synth-lebah-audio.mts   → public/audio/lebah/soundtrack.wav (mono 44,1 kHz)

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { EPISODE, GARDEN, MUSIC, SFX, dayAt } from "../src/productions/lebah/data.ts";

const SR = 44100;
const N = Math.round(EPISODE.duration * SR);
const buf = new Float32Array(N);
const midi = (m: number) => 440 * 2 ** ((m - 69) / 12);

// Generator noise deterministik.
let seed = 12345;
const noise = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

type Osc = (phase: number) => number;
const sine: Osc = (p) => Math.sin(2 * Math.PI * p);
const square: Osc = (p) => {
  // square lembut: harmonik ganjil 1..9
  let s = 0;
  for (let k = 1; k <= 9; k += 2) s += Math.sin(2 * Math.PI * p * k) / k;
  return s * 0.9;
};
const tri: Osc = (p) => 1 - 4 * Math.abs((p % 1) - 0.5);

const tone = (t0: number, dur: number, freq: number | ((t: number) => number), gain: number, osc: Osc = sine, att = 0.005, decay = 0) => {
  const s0 = Math.max(0, Math.round(t0 * SR));
  const s1 = Math.min(N, Math.round((t0 + dur) * SR));
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const f = typeof freq === "number" ? freq : freq(t);
    phase += f / SR;
    let env = Math.min(1, t / att) * Math.min(1, (dur - t) / 0.02);
    if (decay > 0) env *= Math.exp(-t / decay);
    buf[i] += osc(phase) * gain * env;
  }
};

const noiseBurst = (t0: number, dur: number, gain: number, hp = 0.6, env: (u: number) => number = (u) => 1 - u) => {
  const s0 = Math.round(t0 * SR);
  const s1 = Math.min(N, Math.round((t0 + dur) * SR));
  let prev = 0;
  let lp = 0;
  for (let i = s0; i < s1; i++) {
    const u = (i - s0) / (s1 - s0);
    const n = noise();
    const h = n - prev * hp; // high-pass kasar
    prev = n;
    lp += (h - lp) * 0.5;
    buf[i] += lp * gain * env(u);
  }
};

// ---------- instrumen ----------
const musicBox = (t: number, m: number, g = 0.22) => {
  const f = midi(m);
  tone(t, 1.6, f, g, sine, 0.002, 0.5);
  tone(t, 0.8, f * 2.005, g * 0.35, sine, 0.002, 0.25);
  tone(t, 0.3, f * 4.2, g * 0.15, sine, 0.001, 0.06);
};
const piano = (t: number, m: number, g = 0.2, len = 2.5) => {
  const f = midi(m);
  tone(t, len, f, g, sine, 0.004, 0.9);
  tone(t, len, f * 2.001, g * 0.4, sine, 0.004, 0.5);
  tone(t, len * 0.6, f * 3.003, g * 0.15, sine, 0.004, 0.25);
};

// ---------- Babak 1: chiptune 3,6–29 ----------
{
  const [a, b] = MUSIC.chiptune;
  const [brk0, brk1] = MUSIC.chipBreak;
  const beat = 0.25; // 8th @120bpm
  const chords = [
    [60, 64, 67], // C
    [55, 59, 62], // G
    [57, 60, 64], // Am
    [53, 57, 60], // F
  ];
  const melody = [72, 76, 79, 76, 74, 71, 74, 79, 72, 76, 81, 79, 77, 76, 74, 72, 76, 79, 84, 79, 79, 77, 74, 71, 72, 74, 76, 72, 69, 72, 77, 76];
  for (let t = a, i = 0; t < b - 0.01; t += beat, i++) {
    if (t >= brk0 && t < brk1) continue;
    const soft = t >= brk1 ? 0.55 : 1;
    const bar = Math.floor(i / 8) % 4;
    const ch = chords[bar];
    const gIntro = Math.min(1, (t - a) / 0.8);
    // lead (bagian awal sarang lebih jarang)
    const m = melody[i % 32];
    if (!(t < 5 && i % 2 === 1)) tone(t, beat * 0.85, midi(m), 0.07 * soft * gIntro, square, 0.004, 0.18);
    // bass segitiga tiap ketukan
    if (i % 2 === 0) tone(t, beat * 1.8, midi(ch[0] - 24), 0.16 * soft * gIntro, tri, 0.004, 0.35);
    // arpeggio
    tone(t + beat / 2, beat * 0.4, midi(ch[i % 3] + 12), 0.03 * soft * gIntro, square, 0.002, 0.06);
    // hat
    noiseBurst(t + beat / 2, 0.03, 0.05 * soft * gIntro, 0.95);
    // kick lembut
    if (i % 4 === 0) tone(t, 0.12, (x) => 110 * Math.exp(-x * 25) + 45, 0.3 * soft * gIntro, sine, 0.001, 0.06);
  }
}

// ---------- Babak 2: piano 29–40 ----------
{
  const [a, b] = MUSIC.piano;
  const prog = [
    [57, 60, 64, 69], // Am
    [53, 57, 60, 65], // F
    [48, 55, 60, 64], // C
    [55, 59, 62, 67], // G
  ];
  const step = 0.42;
  for (let t = a, i = 0; t < b - 0.6; t += step, i++) {
    const c = prog[Math.floor((t - a) / 2.75) % 4];
    const fade = Math.min(1, (b - 0.4 - t) / 1.2);
    piano(t, c[[0, 2, 1, 3, 2, 1][i % 6]] + 12, 0.11 * fade);
    if (i % 6 === 0) piano(t, c[0] - 12, 0.13 * fade, 3);
  }
  piano(MUSIC.pianoNote, 69 + 12, 0.18, 1.5);
}

// ---------- Babak 3: swell 45–52, music box 55–60 ----------
{
  const [a, b] = MUSIC.swell;
  const chords = [
    [53, 57, 60, 65],
    [48, 55, 60, 64],
    [55, 59, 62, 67],
    [57, 60, 64, 69],
  ];
  chords.forEach((c, k) => {
    const t0 = a + k * 1.75;
    c.forEach((m) => {
      for (const det of [-0.003, 0.003]) {
        const len = 1.95;
        const s0 = Math.round(t0 * SR);
        const s1 = Math.min(N, Math.round((t0 + len) * SR));
        const f = midi(m) * (1 + det);
        for (let i = s0; i < s1; i++) {
          const tt = i / SR;
          const crest = 0.25 + 0.75 * Math.min(1, (tt - a) / (b - a - 1));
          const env = Math.min(1, (i - s0) / SR / 0.4) * Math.min(1, (s1 - i) / SR / 0.4);
          const out = tt > b - 0.6 ? Math.max(0, (b + 1.5 - tt) / 2.1) : 1;
          buf[i] += Math.sin((2 * Math.PI * f * (i - s0)) / SR) * 0.035 * crest * env * out;
        }
      }
    });
  });
  // music box mengulang motif pembuka, berakhir tepat sebelum nada frame 0 (loop)
  const motif = [76, 79, 84, 83, 79, 76, 74, 76, 72];
  const [m0] = MUSIC.musicBox;
  motif.forEach((m, i) => musicBox(m0 + 0.2 + i * 0.5, m, 0.16));
}

// ---------- SFX ----------
for (const cue of SFX) {
  const v = cue.v ?? 1;
  const t = cue.t;
  switch (cue.kind) {
    case "musicbox":
      musicBox(t, cue.p ?? 76, 0.22 * v);
      break;
    case "plop":
      tone(t, 0.12, (x) => 900 * Math.exp(-x * 30) + 250, 0.4 * v, sine, 0.001, 0.05);
      break;
    case "bass":
      tone(t, 0.9, (x) => 70 * Math.exp(-x * 3) + 38, 0.6 * v, sine, 0.002, 0.35);
      noiseBurst(t, 0.15, 0.25 * v, 0.2);
      break;
    case "pop":
      tone(t, 0.07, midi(72 + (cue.p ?? 0) * 2), 0.09 * v, square, 0.002, 0.03);
      break;
    case "boot":
      [72, 79, 84].forEach((m, i) => tone(t + i * 0.08, 0.09, midi(m), 0.1 * v, square, 0.002, 0.05));
      break;
    case "blip":
      tone(t, 0.08, midi(88), 0.07 * v, square, 0.002, 0.04);
      break;
    case "error":
      tone(t, 0.12, midi(64), 0.11 * v, square, 0.002);
      tone(t + 0.14, 0.2, midi(58), 0.11 * v, square, 0.002, 0.1);
      break;
    case "whoosh":
      noiseBurst(t, 0.9, 0.35 * v, 0.3, (u) => Math.sin(Math.PI * u) ** 2);
      break;
    case "shimmer":
      [84, 88, 91, 96].forEach((m, i) => tone(t + i * 0.05, 0.8, midi(m), 0.05 * v, sine, 0.003, 0.3));
      break;
    case "ding": {
      // makin rapat makin pelan agar tidak bising
      const i = cue.p ?? 0;
      const g = 0.11 * (1 - (i / GARDEN.count) * 0.55);
      const m = [84, 86, 88, 91, 93][i % 5];
      tone(t, 0.35, midi(m), g, sine, 0.001, 0.12);
      tone(t, 0.2, midi(m) * 2.76, g * 0.3, sine, 0.001, 0.05);
      break;
    }
    case "softDing":
      tone(t, 1.4, midi(81), 0.14 * v, sine, 0.003, 0.6);
      tone(t, 1.0, midi(88), 0.06 * v, sine, 0.003, 0.4);
      break;
    case "tick":
      noiseBurst(t, 0.015, 0.25 * v, 0.95);
      break;
    case "clink":
      [2900, 4100, 5300].forEach((f, k) => tone(t, 0.25, f, (0.06 / (k + 1)) * v, sine, 0.0005, 0.07));
      break;
    default:
      break;
  }
}

// tick penghitung hari (tiap pergantian hari 5–12 dtk)
for (let s = 5.0; s < 12.0; s += 0.005) {
  if (dayAt(s + 0.005) !== dayAt(s)) noiseBurst(s, 0.012, 0.22, 0.95);
}
// tick penghitung 12 → 850 (46,6–48,0, melambat)
for (let k = 0; k < 22; k++) noiseBurst(46.65 + 1.4 * (k / 22) ** 1.6, 0.012, 0.18, 0.95);

// buzz sayap di taman (17–26) dan kepakan berat saat menua (29–40)
{
  const s0 = Math.round(17 * SR);
  const s1 = Math.round(26 * SR);
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const tt = i / SR;
    ph += (225 + Math.sin(tt * 3) * 8) / SR;
    const env = Math.min(1, (tt - 17) / 0.4) * Math.min(1, (26 - tt) / 0.3);
    buf[i] += (2 * (ph % 1) - 1) * 0.018 * env * (0.7 + 0.3 * Math.sin(tt * 2 * Math.PI * 9));
  }
  const h0 = Math.round(29 * SR);
  const h1 = Math.round(40 * SR);
  ph = 0;
  for (let i = h0; i < h1; i++) {
    const tt = i / SR;
    const age = (tt - 29) / 11;
    ph += (210 - age * 90) / SR;
    const flapRate = 6 - age * 3;
    const am = Math.max(0, Math.sin(tt * 2 * Math.PI * flapRate)) ** 2;
    const env = Math.min(1, (tt - 29) / 0.5) * Math.min(1, (40 - tt) / 0.5);
    buf[i] += (2 * (ph % 1) - 1) * 0.022 * am * env;
  }
}

// ---------- hening total 40–43,5 ----------
{
  const [a, b] = MUSIC.silence;
  for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) buf[i] = 0;
  const fadeIn = Math.round(0.08 * SR);
  for (let i = Math.round(a * SR) - fadeIn; i < Math.round(a * SR); i++) buf[i] *= (Math.round(a * SR) - i) / fadeIn;
}

// ---------- normalisasi + soft clip ----------
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / peak;
const pcm = Buffer.alloc(44 + N * 2);
pcm.write("RIFF", 0);
pcm.writeUInt32LE(36 + N * 2, 4);
pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28);
pcm.writeUInt16LE(2, 32);
pcm.writeUInt16LE(16, 34);
pcm.write("data", 36);
pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(Math.tanh(buf[i] * g) * 32000), 44 + i * 2);

const out = path.resolve("public/audio/lebah/soundtrack.wav");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, pcm);
console.log(`${out} · ${EPISODE.duration} dtk · puncak ${peak.toFixed(2)} → dinormalisasi`);
