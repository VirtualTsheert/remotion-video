import React from "react";
import { useCurrentFrame } from "remotion";
import { key, type CameraKey } from "../camera/Camera2D";
import { progress } from "../animation/motion";
import { COLORS, EASE } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

export type ChronoEvent = {
  // Frame saat peristiwa muncul (kamera sudah tiba sedikit sebelumnya).
  at: number;
  date: string;
  title: string;
  detail?: string;
};

export type ChronologyLayout = { x: number; top: number; spacing: number };
const DEFAULT_LAYOUT: ChronologyLayout = { x: 240, top: 700, spacing: 560 };

const eventY = (i: number, l: ChronologyLayout) => l.top + i * l.spacing;

// Garis waktu vertikal dalam koordinat dunia. Garis tumbuh dari peristiwa ke
// peristiwa; setiap peristiwa muncul saat `at`.
export const Chronology: React.FC<{ events: ChronoEvent[]; layout?: Partial<ChronologyLayout> }> = ({ events, layout }) => {
  const frame = useCurrentFrame();
  const l = { ...DEFAULT_LAYOUT, ...layout };
  // Ujung garis: bergerak dari peristiwa sebelumnya ke yang sedang muncul.
  let lineEnd = eventY(0, l);
  events.forEach((e, i) => {
    if (i === 0) return;
    const p = progress(frame, e.at - 20, 20, EASE.inOut);
    if (p > 0) lineEnd = eventY(i - 1, l) + (eventY(i, l) - eventY(i - 1, l)) * p;
  });
  return (
    <>
      <div style={{ position: "absolute", left: l.x - 3, top: eventY(0, l), width: 6, height: lineEnd - eventY(0, l), background: COLORS.accent }} />
      <div style={{ position: "absolute", left: l.x - 1, top: eventY(0, l), width: 2, height: eventY(events.length - 1, l) - eventY(0, l), background: COLORS.steel }} />
      {events.map((e, i) => {
        // Mulai muncul di tengah perjalanan kamera agar layar tidak sempat kosong.
        const p = progress(frame, e.at - 10, 18);
        const past = events.some((n, j) => j > i && frame >= n.at);
        return (
          <div key={i} style={{ position: "absolute", left: l.x, top: eventY(i, l), opacity: past ? 0.45 : 1 }}>
            <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: "50%", background: COLORS.ink, border: `6px solid ${COLORS.accent}`, boxSizing: "border-box", scale: p }} />
            <div style={{ position: "absolute", left: 60, top: -34, width: 600, opacity: p, translate: `${(1 - p) * 40}px 0` }}>
              <div style={{ fontFamily: FONTS.mono, fontWeight: 600, fontSize: 44, color: COLORS.accent, letterSpacing: 2 }}>{e.date}</div>
              <div style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 68, lineHeight: 1.08, color: COLORS.paper, marginTop: 8 }}>{e.title}</div>
              {e.detail ? (
                <div style={{ fontFamily: FONTS.sans, fontSize: 44, lineHeight: 1.3, color: COLORS.fog, marginTop: 14, opacity: progress(frame, e.at + 10, 15) }}>{e.detail}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

// Keyframe kamera yang mengikuti garis waktu: berangkat `travel` frame sebelum
// peristiwa berikutnya dan tiba tepat saat ia muncul (bersamaan dengan garis
// yang tumbuh), lalu bertahan dengan drift kecil. Tidak ada jeda layar kosong.
export const chronologyCamera = (
  events: ChronoEvent[],
  opts: { layout?: Partial<ChronologyLayout>; zoom?: number; centerX?: number; travel?: number } = {},
): CameraKey[] => {
  const l = { ...DEFAULT_LAYOUT, ...opts.layout };
  // Default diukur agar teks peristiwa (lebar 600) tetap di dalam area aman.
  const zoom = opts.zoom ?? 1.25;
  const cx = opts.centerX ?? 580;
  const travel = opts.travel ?? 20;
  const keys: CameraKey[] = [];
  events.forEach((e, i) => {
    const y = eventY(i, l) - 40;
    keys.push(key(i === 0 ? 0 : e.at, [cx, y], zoom, { ease: EASE.inOut }));
    const next = events[i + 1];
    if (next) {
      if (next.at - travel <= e.at) throw new Error(`Peristiwa "${next.title}" terlalu rapat: beri jarak > ${travel} frame`);
      keys.push(key(next.at - travel, [cx, y + 40], zoom * 1.03, { ease: EASE.drift }));
    }
  });
  return keys;
};
