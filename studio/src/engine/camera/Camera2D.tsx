import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { sampleTrack, type Ease, type Keyframe } from "./track";

// Kamera virtual 2D untuk dunia DOM/SVG (meja investigasi, peta, foto arsip).
// Dunia memakai koordinat piksel bebas; kamera menentukan TITIK FOKUS dunia
// yang berada di tengah layar, tingkat zoom, dan kemiringan.
export type CameraState = { focus: [number, number]; zoom: number; rotate: number };

export type CameraKey = Keyframe<{ focus: [number, number]; zoom: number; rotate: number }>;

// Penulisan keyframe yang ringkas: key(frame, [x, y], zoom, { rotate, ease }).
export const key = (
  frame: number,
  focus: [number, number],
  zoom = 1,
  opts: { rotate?: number; ease?: Ease } = {},
): CameraKey => ({ frame, focus, zoom, rotate: opts.rotate ?? 0, ease: opts.ease });

// Titik fokus kamera agar `point` pada lapisan berkedalaman `depth` berada tepat
// di tengah layar. Diperlukan karena fokus kamera dinyatakan di bidang depth = 1.
export const focusOn = (
  point: [number, number],
  depth: number,
  anchor: [number, number],
): [number, number] => [
  anchor[0] + (point[0] - anchor[0]) / depth,
  anchor[1] + (point[1] - anchor[1]) / depth,
];

export type Handheld = { amount?: number; rotate?: number; speed?: number; seed?: string };

const CameraContext = createContext<CameraState | null>(null);

export const useCamera = () => {
  const cam = useContext(CameraContext);
  if (!cam) throw new Error("<Layer> harus berada di dalam <Camera2D>");
  return cam;
};

export const Camera2D: React.FC<{
  keys: CameraKey[];
  // Getaran tangan halus (deterministik). Untuk kesan dokumenter, bukan efek.
  handheld?: Handheld;
  background?: string;
  children: React.ReactNode;
}> = ({ keys, handheld, background, children }) => {
  const frame = useCurrentFrame();
  const cam = sampleTrack(keys, frame, ["zoom"]);
  let { focus, rotate } = cam;
  if (handheld) {
    const { amount = 6, rotate: rot = 0.25, speed = 0.015, seed = "hand" } = handheld;
    const t = frame * speed;
    // Getaran dalam piksel layar → dibagi zoom agar tidak membesar saat close-up.
    focus = [
      focus[0] + (noise2D(`${seed}x`, t, 0) * amount) / cam.zoom,
      focus[1] + (noise2D(`${seed}y`, 0, t) * amount) / cam.zoom,
    ];
    rotate += noise2D(`${seed}r`, t, t) * rot;
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: background }}>
      <CameraContext.Provider value={{ focus, zoom: cam.zoom, rotate }}>
        {children}
      </CameraContext.Provider>
    </AbsoluteFill>
  );
};

// Satu bidang dunia pada kedalaman tertentu.
//  depth = 1   → bidang utama (bergerak persis mengikuti kamera)
//  depth < 1   → lebih jauh (latar), bergerak & membesar lebih sedikit
//  depth > 1   → lebih dekat (foreground), bergerak & membesar lebih banyak
// Anak-anak Layer diposisikan absolut dalam koordinat dunia.
export const Layer: React.FC<{
  depth?: number;
  // Titik dunia tempat semua layer sejajar (default: tengah layar awal).
  anchor?: [number, number];
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ depth = 1, anchor, style, children }) => {
  const cam = useCamera();
  const { width, height } = useVideoConfig();
  const [ax, ay] = anchor ?? [width / 2, height / 2];
  const sx = ax + (cam.focus[0] - ax) * depth;
  const sy = ay + (cam.focus[1] - ay) * depth;
  const zoom = Math.pow(cam.zoom, depth);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transformOrigin: "0 0",
        transform: `translate(${width / 2}px, ${height / 2}px) rotate(${cam.rotate}deg) scale(${zoom}) translate(${-sx}px, ${-sy}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Utilitas penempatan objek di koordinat dunia.
export const At: React.FC<{
  x: number;
  y: number;
  // Titik acuan objek: 0.5,0.5 = tengah objek berada di (x, y).
  origin?: [number, number];
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, origin = [0.5, 0.5], style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: `${-origin[0] * 100}% ${-origin[1] * 100}%`,
      ...style,
    }}
  >
    {children}
  </div>
);
