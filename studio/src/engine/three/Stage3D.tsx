import React from "react";
import { AbsoluteFill, getInputProps, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

// Kanvas 3D yang dioptimalkan untuk render CPU (SwiftShader).
// Biaya render 3D sebanding dengan jumlah piksel, jadi kanvas dirender pada
// resolusi lebih rendah lalu diperbesar CSS. Grain + vignette menyamarkan
// kehalusan yang hilang. MSAA tetap aktif: mematikannya hanya menghemat ~10%
// tetapi tepi diagonal terlihat bergerigi (diukur di Codespace 2 vCPU).
//
// Prioritas kualitas: prop `quality` > input prop `quality3d` (untuk draft:
// --props='{"quality3d":0.5}') > default 0.75.
export const Stage3D: React.FC<{
  quality?: number;
  background: string;
  fog?: [number, number];
  fov?: number;
  children: React.ReactNode;
}> = ({ quality, background, fog, fov = 40, children }) => {
  const { width, height } = useVideoConfig();
  const fromProps = Number(getInputProps().quality3d);
  const q = quality ?? (Number.isFinite(fromProps) && fromProps > 0 ? fromProps : 0.75);
  const w = Math.round(width * q);
  const h = Math.round(height * q);
  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", scale: 1 / q }}>
        <ThreeCanvas width={w} height={h} camera={{ fov, near: 0.1, far: 200 }} gl={{ antialias: true }}>
          <color attach="background" args={[background]} />
          {fog ? <fog attach="fog" args={[background, fog[0], fog[1]]} /> : null}
          {children}
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};
