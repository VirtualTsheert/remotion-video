import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { noise2D } from "@remotion/noise";
import {
  Camera2D,
  Layer,
  useCamera,
  type CameraKey,
  type Handheld,
} from "../camera/Camera2D";
import { isDebug } from "../../config/video";

// Satu potongan foto (PNG/SVG transparan) pada kedalaman tertentu.
export type ParallaxLayer = {
  src: string;
  depth: number;
  // Posisi & ukuran dalam koordinat dunia (default: menutupi seluruh adegan).
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Blur statis untuk kesan depth-of-field. Mahal di render CPU: pakai seperlunya.
  blur?: number;
  // Isi lapisan menyentuh tepi gambar (latar, tanah): tepinya tidak boleh terlihat.
  // Default: true untuk lapisan terjauh.
  fullBleed?: boolean;
};

const TREATMENTS = {
  archive: "grayscale(1) sepia(0.4) contrast(1.05) brightness(0.97)",
  none: undefined,
} as const;

// Foto arsip 2.5D: lapisan-lapisan potongan foto bergerak dengan paralaks
// mengikuti kamera virtual. Ukuran adegan = ukuran dunia (umumnya ukuran foto).
// Agar tepi tidak terlihat, foto sebaiknya ≥1,4× layar dan zoom kamera ≥1.
export const ParallaxScene: React.FC<{
  width: number;
  height: number;
  layers: ParallaxLayer[];
  keys: CameraKey[];
  handheld?: Handheld;
  treatment?: keyof typeof TREATMENTS;
  // Kabut tipis di antara lapisan (0–1) untuk memisahkan kedalaman.
  haze?: number;
  // Jumlah partikel debu di depan lensa.
  dust?: number;
}> = ({
  width,
  height,
  layers,
  keys,
  handheld,
  treatment = "archive",
  haze = 0.12,
  dust = 70,
}) => {
  const anchor: [number, number] = [width / 2, height / 2];
  const sorted = [...layers].sort((a, b) => a.depth - b.depth);
  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      <Camera2D keys={keys} handheld={handheld}>
        <AbsoluteFill style={{ filter: TREATMENTS[treatment] }}>
          {sorted.map((layer, i) => (
            <React.Fragment key={layer.src}>
              {i > 0 && haze > 0 ? (
                <Layer depth={layer.depth} anchor={anchor}>
                  <div
                    style={{
                      position: "absolute",
                      left: -width,
                      top: -height,
                      width: width * 3,
                      height: height * 3,
                      background: `rgba(235,230,220,${haze})`,
                    }}
                  />
                </Layer>
              ) : null}
              <Layer depth={layer.depth} anchor={anchor}>
                <Img
                  src={layer.src}
                  style={{
                    position: "absolute",
                    left: layer.x ?? 0,
                    top: layer.y ?? 0,
                    width: layer.width ?? width,
                    height: layer.height ?? height,
                    filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
                  }}
                />
              </Layer>
            </React.Fragment>
          ))}
          {dust > 0 ? (
            <Dust count={dust} width={width} height={height} anchor={anchor} />
          ) : null}
        </AbsoluteFill>
        {isDebug() ? (
          <EdgeWarning
            layers={sorted}
            width={width}
            height={height}
            anchor={anchor}
          />
        ) : null}
      </Camera2D>
    </AbsoluteFill>
  );
};

// Debu melayang di depan lensa (kedalaman > bidang utama). Gerak dari noise
// deterministik, sehingga setiap render menghasilkan frame yang sama.
const Dust: React.FC<{
  count: number;
  width: number;
  height: number;
  anchor: [number, number];
}> = ({ count, width, height, anchor }) => {
  const frame = useCurrentFrame();
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: random(`dx${i}`) * width,
        y: random(`dy${i}`) * height,
        r: 2 + random(`dr${i}`) * 4.5,
        o: 0.25 + random(`do${i}`) * 0.5,
      })),
    [count, width, height],
  );
  return (
    <Layer depth={1.35} anchor={anchor}>
      {motes.map((m, i) => {
        const t = frame * 0.006;
        const x = m.x + noise2D(`mx${i}`, t, 0) * 60 + frame * 0.4;
        const y = m.y + noise2D(`my${i}`, 0, t) * 60 - frame * 0.25;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: "50%",
              background: "#fff6e0",
              opacity: m.o * (0.6 + 0.4 * noise2D(`mo${i}`, t * 3, t)),
            }}
          />
        );
      })}
    </Layer>
  );
};

// Peringatan (mode debug): lapisan full-bleed yang tidak lagi menutupi layar,
// artinya tepi foto akan terlihat. Perbaiki dengan zoom lebih besar atau fokus
// yang tidak terlalu ke pinggir.
const EdgeWarning: React.FC<{
  layers: ParallaxLayer[];
  width: number;
  height: number;
  anchor: [number, number];
}> = ({ layers, width, height, anchor }) => {
  const cam = useCamera();
  const { width: sw, height: sh } = useVideoConfig();
  const exposed = layers.filter((layer, i) => {
    if (!(layer.fullBleed ?? i === 0)) return false;
    const z = Math.pow(cam.zoom, layer.depth);
    const sx = anchor[0] + (cam.focus[0] - anchor[0]) * layer.depth;
    const sy = anchor[1] + (cam.focus[1] - anchor[1]) * layer.depth;
    const x0 = layer.x ?? 0;
    const y0 = layer.y ?? 0;
    const left = (x0 - sx) * z + sw / 2;
    const right = (x0 + (layer.width ?? width) - sx) * z + sw / 2;
    const top = (y0 - sy) * z + sh / 2;
    const bottom = (y0 + (layer.height ?? height) - sy) * z + sh / 2;
    return left > 0 || top > 0 || right < sw || bottom < sh;
  });
  if (exposed.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        outline: "8px solid red",
        outlineOffset: -8,
        color: "red",
        font: "bold 40px sans-serif",
        padding: 40,
      }}
    >
      ⚠ tepi lapisan terlihat:{" "}
      {exposed.map((l) => l.src.split("/").pop()).join(", ")}
    </div>
  );
};
