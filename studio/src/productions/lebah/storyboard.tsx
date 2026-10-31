import React from "react";
import { AbsoluteFill } from "remotion";
import { seconds } from "../../config/video";
import type { Production, Shot } from "../../storyboard/types";
import { EPISODE, SCENES, type SceneId } from "./data";
import { CardsLayer, HudLayer } from "./ui";
import { Keluar, Macet, Pilih, Sabar, Sarang, Sendok, Taman, Tetes } from "./scenes1";
import { Menua, Penutup, Perjalanan, Selesai, Senja, Skala, Teh } from "./scenes2";

// "1 Sendok = Seumur Hidup 12 Lebah" — hidup satu lebah sebagai game.
// Tanpa voice over: cerita dibawa teks layar (CARDS), HUD, dan musik.
// Semua shot disambung potong langsung agar waktu sama persis dengan data.ts.

const COMPONENTS: Record<SceneId, React.FC> = {
  Sendok, Tetes, Pilih, Sarang, Macet, Keluar, Taman, Sabar, Menua, Selesai, Senja, Perjalanan, Skala, Teh, Penutup,
};

const PURPOSE: Record<SceneId, string> = {
  Sendok: "Hook: satu sendok madu, menetes.",
  Tetes: "Skala awal: 12 lebah di dalam satu tetes.",
  Pilih: "Memilih tokoh: Lebah #37.214, HUD menyala.",
  Sarang: "Hari 1–21 di dalam sarang: empat pekerjaan.",
  Macet: "Lucu: tiga minggu, progress misi masih 0%.",
  Keluar: "Hari 22: keluar sarang pertama kali.",
  Taman: "Fakta terbang: kecepatan, kepakan, 50–100 bunga.",
  Sabar: "Punchline: progress baru 3%.",
  Menua: "Sedih: sayap robek, hari berganti cepat.",
  Selesai: "Misi selesai: hanya satu tetes kecil.",
  Senja: "Akhir hidup, hening total.",
  Perjalanan: "Tetesannya tetap sampai ke sendok.",
  Skala: "Wow skala: sendok → botol → keliling Bumi.",
  Teh: "Kontras: dihabiskan dalam 3 detik.",
  Penutup: "Refleksi + kembali ke frame pertama (loop).",
};

const Overlay: React.FC = () => (
  <AbsoluteFill>
    <HudLayer />
    <CardsLayer />
  </AbsoluteFill>
);

export const lebah: Production = {
  id: EPISODE.id,
  title: EPISODE.title,
  background: "#FFF4DC",
  overlay: Overlay,
  soundtrack: "audio/lebah/soundtrack.wav",
  shots: SCENES.map(
    (s): Shot => ({
      id: s.id,
      purpose: PURPOSE[s.id],
      technique: "motion-graphics",
      camera: "Zoom/pan pelan terus-menerus; tidak ada frame diam > 2 dtk.",
      durationInFrames: seconds(s.to) - seconds(s.from),
      component: COMPONENTS[s.id],
    }),
  ),
};
