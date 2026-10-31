import React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";
import { useCamera } from "../camera/Camera2D";
import { progress } from "../animation/motion";
import { ProjectionContext, imageProjection } from "./geo";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

type BBox = readonly [number, number, number, number];
type Size = readonly [number, number];

// Citra satelit sebagai "dunia" kamera: gambar di (0,0) seukuran piksel aslinya,
// dan MapPin/GeoRoute/MapLabel di dalamnya otomatis memakai koordinat citra.
// Tanpa `src`: hanya menyediakan proyeksi (mis. untuk overlay di atas <BeforeAfter>).
// Dipakai di dalam <Layer> sebuah <Camera2D>.
export const ImageWorld: React.FC<{ src?: string; bbox: BBox; size: Size; children?: React.ReactNode }> = ({
  src,
  bbox,
  size,
  children,
}) => (
  <ProjectionContext.Provider value={imageProjection(bbox, size)}>
    {src ? <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: size[0], height: size[1] }} /> : null}
    {children}
  </ProjectionContext.Provider>
);

// Sebelum/sesudah: garis pemisah menyapu dari kiri ke kanan, membuka citra "sesudah".
// Keduanya harus berbbox & berukuran sama. Dipakai di dalam <Layer>.
export const BeforeAfter: React.FC<{
  before: string;
  after: string;
  size: Size;
  start: number;
  duration?: number;
}> = ({ before, after, size, start, duration = 45 }) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const p = progress(frame, start, duration, EASE.inOut);
  const x = p * size[0];
  return (
    <>
      <Img src={before} style={{ position: "absolute", left: 0, top: 0, width: size[0], height: size[1] }} />
      <Img
        src={after}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size[0],
          height: size[1],
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        }}
      />
      {p > 0 && p < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 5 / cam.zoom,
            height: size[1],
            translate: "-50% 0",
            background: COLORS.white,
            boxShadow: `0 0 ${24 / cam.zoom}px ${COLORS.highlight}`,
          }}
        />
      ) : null}
    </>
  );
};

export type ViewerFrame = { src: string; from: number; label: string };
export type ViewerOverlay = { src: string; from: number; opacity?: number; scan?: boolean };

// Penampil citra satelit berbingkai (ruang layar): urutan citra bertanggal yang
// berganti dengan crossfade, cap tanggal, dan overlay hasil analisis yang
// "dipindai" masuk. Cocok untuk citra resolusi sedang (HLS 30 m) yang akan
// kabur bila dipaksa layar penuh.
export const SatelliteViewer: React.FC<{
  frames: ViewerFrame[];
  overlays?: ViewerOverlay[];
  imageSize: Size;
  // Kamera di dalam panel: titik fokus (piksel citra) dan zoom awal→akhir.
  focus: [number, number];
  zoom: [number, number];
  duration: number;
  sensor: string;
  coordinates: string;
  left: number;
  top: number;
  size: number;
  children?: React.ReactNode;
}> = ({ frames, overlays = [], imageSize, focus, zoom, duration, sensor, coordinates, left, top, size, children }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, duration], zoom, { ...clamp, easing: EASE.drift });
  const base = size / Math.min(imageSize[0], imageSize[1]);
  const scale = base * z;
  const tx = size / 2 - focus[0] * scale;
  const ty = size / 2 - focus[1] * scale;
  const current = [...frames].reverse().find((f) => frame >= f.from) ?? frames[0];
  const corner = (pos: React.CSSProperties, rot: number) => (
    <div style={{ position: "absolute", width: 48, height: 48, borderTop: `5px solid ${COLORS.white}`, borderLeft: `5px solid ${COLORS.white}`, rotate: `${rot}deg`, ...pos }} />
  );
  return (
    <div style={{ position: "absolute", left, top, width: size, height: size + 120 }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 30, color: COLORS.fog, letterSpacing: 3, display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span>{sensor}</span>
        <span>{coordinates}</span>
      </div>
      <div style={{ position: "relative", width: size, height: size, overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
          {frames.map((f, i) => {
            const next = frames[i + 1];
            const fadeIn = i === 0 ? 1 : progress(frame, f.from, 10, EASE.inOut);
            const visible = frame >= f.from - 1 && (!next || frame < next.from + 12);
            return visible ? (
              <Img key={f.src} src={f.src} style={{ position: "absolute", left: 0, top: 0, width: imageSize[0], height: imageSize[1], opacity: fadeIn }} />
            ) : null;
          })}
          {overlays.map((o) => {
            if (frame < o.from) return null;
            const scan = o.scan ? progress(frame, o.from, 24, EASE.inOut) : 1;
            return (
              <Img
                key={o.src}
                src={o.src}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: imageSize[0],
                  height: imageSize[1],
                  opacity: o.opacity ?? 1,
                  clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)`,
                }}
              />
            );
          })}
          {children}
        </div>
        {/* Garis pindai mengikuti overlay yang sedang dipindai */}
        {overlays
          .filter((o) => o.scan && frame >= o.from && frame < o.from + 24)
          .map((o) => (
            <div key={o.src} style={{ position: "absolute", left: 0, right: 0, height: 4, top: `${progress(frame, o.from, 24, EASE.inOut) * 100}%`, background: COLORS.highlight, boxShadow: `0 0 24px ${COLORS.highlight}` }} />
          ))}
        {corner({ left: 16, top: 16 }, 0)}
        {corner({ right: 16, top: 16 }, 90)}
        {corner({ right: 16, bottom: 16 }, 180)}
        {corner({ left: 16, bottom: 16 }, 270)}
      </div>
      <div style={{ marginTop: 18, fontFamily: FONTS.mono, fontWeight: 600, fontSize: 56, color: COLORS.white, letterSpacing: 2 }}>
        {current.label}
      </div>
    </div>
  );
};
