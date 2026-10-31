import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera2D, Layer, key } from "../engine/camera/Camera2D";
import { Chronology, chronologyCamera, type ChronoEvent } from "../engine/graphics/Chronology";
import { Counter, Network, type Actor, type Link } from "../engine/graphics/Network";
import { progress } from "../engine/animation/motion";
import { Finish, SafeAreaGuide } from "../engine/layers/Finish";
import { COLORS, EASE } from "../theme/tokens";
import { FONTS } from "../theme/fonts";

// Semua isi di bawah adalah CONTOH untuk pengujian komponen.
const EVENTS: ChronoEvent[] = [
  // at negatif: peristiwa pertama sudah tampil di frame 0 (pembukaan tidak kosong).
  { at: -12, date: "JANUARI 1900", title: "Peristiwa pertama", detail: "Keterangan singkat peristiwa." },
  { at: 75, date: "MARET 1900", title: "Peristiwa kedua", detail: "Kamera berpindah saat peristiwa muncul." },
  { at: 140, date: "JULI 1900", title: "Peristiwa ketiga" },
  { at: 200, date: "DESEMBER 1900", title: "Peristiwa keempat", detail: "Peristiwa lama meredup." },
];

// Uji kronologi: kamera otomatis mengikuti peristiwa satu per satu.
export const ChronologyLab: React.FC = () => (
  <AbsoluteFill>
    <Camera2D background={COLORS.ink} keys={chronologyCamera(EVENTS)}>
      <Layer>
        <Chronology events={EVENTS} />
      </Layer>
    </Camera2D>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

const ACTORS: Actor[] = [
  { id: "a", name: "Tokoh A", role: "pejabat", x: 540, y: 700, at: 5, focus: true },
  { id: "b", name: "Tokoh B", role: "pengusaha", x: 240, y: 1230, at: 45 },
  { id: "c", name: "Tokoh C", role: "perantara", x: 840, y: 1230, at: 75 },
  { id: "d", name: "Tokoh D", role: "saksi", x: 540, y: 1700, at: 120 },
];
const LINKS: Link[] = [
  { from: "a", to: "b", at: 55, label: "kontrak", kind: "confirmed" },
  { from: "a", to: "c", at: 85, label: "rapat", kind: "confirmed" },
  { from: "c", to: "d", at: 130, label: "dana", kind: "alleged", labelAt: 0.62 },
  { from: "b", to: "d", at: 155, kind: "confirmed" },
];

// Uji jaringan aktor: mulai dekat pada tokoh utama, lalu mundur
// untuk memperlihatkan siapa saja yang terhubung dengannya.
export const NetworkLab: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Camera2D
        background={COLORS.ink}
        keys={[
          key(0, [540, 760], 1.7),
          key(70, [540, 980], 1.1),
          key(170, [540, 1260], 0.82),
          key(239, [540, 1280], 0.8, { ease: EASE.drift }),
        ]}
      >
        <Layer>
          <Network actors={ACTORS} links={LINKS} />
        </Layer>
      </Camera2D>
      <div style={{ position: "absolute", top: 240, left: 80, opacity: progress(frame, 175, 15) }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 32, color: COLORS.fog, letterSpacing: 4 }}>DOKUMEN CONTOH</div>
        <Counter to={1284} start={180} style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 120, color: COLORS.paper }} />
      </div>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
