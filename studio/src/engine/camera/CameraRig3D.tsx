import React from "react";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { sampleTrack, type Ease, type Keyframe } from "./track";

type Vec3 = [number, number, number];
export type Camera3DState = { position: Vec3; target: Vec3; fov: number };
export type Camera3DKey = Keyframe<Camera3DState>;

export const key3d = (
  frame: number,
  position: Vec3,
  target: Vec3,
  opts: { fov?: number; ease?: Ease } = {},
): Camera3DKey => ({ frame, position, target, fov: opts.fov ?? 40, ease: opts.ease });

type Range = number | [number, number];
const at = (r: Range, t: number) => (typeof r === "number" ? r : r[0] + (r[1] - r[0]) * t);

// Orbit mengelilingi subjek. Diinterpolasi pada sudut (bukan posisi) agar
// lintasan tetap melingkar. Radius/tinggi berupa [awal, akhir] menghasilkan
// spiral (mis. turun mendekati subjek sambil berputar).
export const orbit =
  (opts: {
    target: Vec3;
    radius: Range;
    height: Range;
    fromDeg: number;
    toDeg: number;
    startFrame: number;
    endFrame: number;
    fov?: number;
    ease?: Ease;
  }) =>
  (frame: number): Camera3DState => {
    const raw = Math.min(1, Math.max(0, (frame - opts.startFrame) / (opts.endFrame - opts.startFrame)));
    const t = opts.ease ? opts.ease(raw) : raw;
    const a = ((opts.fromDeg + (opts.toDeg - opts.fromDeg) * t) * Math.PI) / 180;
    const [tx, ty, tz] = opts.target;
    return {
      position: [tx + Math.sin(a) * at(opts.radius, t), ty + at(opts.height, t), tz + Math.cos(a) * at(opts.radius, t)],
      target: opts.target,
      fov: opts.fov ?? 40,
    };
  };

export type Camera3DPath = Camera3DKey[] | ((frame: number) => Camera3DState);

export const cameraStateAt = (path: Camera3DPath, frame: number): Camera3DState =>
  typeof path === "function" ? path(frame) : sampleTrack(path, frame);

// Menggerakkan kamera R3F dari keyframe atau fungsi frame→state.
// Diperbarui saat render React (bukan useFrame) agar deterministik per frame.
export const CameraRig3D: React.FC<{ path: Camera3DPath }> = ({ path }) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const state = cameraStateAt(path, frame);
  camera.position.set(...state.position);
  if (camera.fov !== state.fov) {
    camera.fov = state.fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(...state.target);
  return null;
};
