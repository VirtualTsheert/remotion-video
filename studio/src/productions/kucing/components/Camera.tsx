import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";

// ---------------------------------------------------------------------------
// CinematicCamera: kamera virtual untuk dunia SVG berlapis (2.5D).
// Keyframe {frame, x, y, zoom, rot}: titik dunia (x,y) di tengah layar.
// Lapisan (ParallaxLayer) punya `depth`: 1 = bidang subjek, <1 jauh, >1 dekat
// lensa. Pergeseran & zoom kamera dikalikan depth → paralaks alami.
// Gerakan dolly/pan/tracking cukup dibedakan lewat keyframe.
// ---------------------------------------------------------------------------

export type CamKey = { frame: number; x: number; y: number; zoom: number; rot?: number; ease?: (t: number) => number };
export type CamState = { x: number; y: number; zoom: number; rot: number; vx: number };

const SMOOTH = Easing.bezier(0.45, 0, 0.25, 1);

export const sampleCam = (keys: CamKey[], frame: number): CamState => {
  const at = (fr: number) => {
    let i = 0;
    while (i < keys.length - 1 && fr >= keys[i + 1].frame) i++;
    const a = keys[i];
    const b = keys[Math.min(i + 1, keys.length - 1)];
    const span = b.frame - a.frame;
    const raw = span <= 0 ? 1 : Math.min(1, Math.max(0, (fr - a.frame) / span));
    const t = (b.ease ?? SMOOTH)(raw);
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      // zoom di ruang log: kecepatan dolly terasa konstan
      zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t),
      rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t,
    };
  };
  const c = at(frame);
  const p = at(frame - 1);
  return { ...c, vx: (c.x - p.x) * c.zoom };
};

type Ctx = { cam: CamState; anchor: [number, number]; W: number; H: number };
const CameraCtx = createContext<Ctx | null>(null);
export const useCam = () => {
  const c = useContext(CameraCtx);
  if (!c) throw new Error("ParallaxLayer harus di dalam CinematicCamera");
  return c;
};

export const CinematicCamera: React.FC<{
  keys: CamKey[];
  anchor?: [number, number];
  handheld?: number; // amplitudo getar halus (px layar)
  children: React.ReactNode;
}> = ({ keys, anchor, handheld = 0, children }) => {
  const frame = useCurrentFrame();
  const base = sampleCam(keys, frame);
  const t = frame / 30;
  const cam: CamState = {
    ...base,
    x: base.x + (noise2D("cx", t * 0.18, 0) * handheld) / base.zoom,
    y: base.y + (noise2D("cy", 0, t * 0.18) * handheld) / base.zoom,
    rot: base.rot + noise2D("cr", t * 0.12, t * 0.1) * handheld * 0.02,
  };
  return (
    <CameraCtx.Provider value={{ cam, anchor: anchor ?? [keys[0].x, keys[0].y], W: 1080, H: 1920 }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
    </CameraCtx.Provider>
  );
};

// Transform SVG untuk lapisan berkedalaman `depth`.
export const layerTransform = (ctx: Ctx, depth: number) => {
  const { cam, anchor, W, H } = ctx;
  const fx = anchor[0] + (cam.x - anchor[0]) * depth;
  const fy = anchor[1] + (cam.y - anchor[1]) * depth;
  const z = Math.pow(cam.zoom, depth);
  return `translate(${W / 2},${H / 2}) rotate(${cam.rot}) scale(${z}) translate(${-fx},${-fy})`;
};

// Satu lapisan paralaks. `blur` = depth of field simulatif (px layar).
// `motionBlur` mengaburkan arah horizontal saat kamera bergerak cepat (whip pan).
export const ParallaxLayer: React.FC<{
  depth: number;
  blur?: number;
  motionBlur?: boolean;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  children: React.ReactNode;
}> = ({ depth, blur = 0, motionBlur = false, opacity = 1, blend, children }) => {
  const ctx = useCam();
  const mb = motionBlur ? Math.min(14, Math.abs(ctx.cam.vx) * depth * 0.35) : 0;
  const filters = [blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "", mb > 1.5 ? `url(#mb-${Math.round(mb)})` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <AbsoluteFill style={{ filter: filters || undefined, opacity, mixBlendMode: blend }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ overflow: "visible" }}>
        {mb > 1.5 ? (
          <defs>
            <filter id={`mb-${Math.round(mb)}`} x="-5%" y="0" width="110%" height="100%">
              <feGaussianBlur stdDeviation={`${Math.round(mb)} 0`} />
            </filter>
          </defs>
        ) : null}
        <g transform={layerTransform(ctx, depth)}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};
