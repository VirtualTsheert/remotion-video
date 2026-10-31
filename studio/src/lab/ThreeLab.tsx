import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { Stage3D } from "../engine/three/Stage3D";
import { CityModel, cityLayout } from "../engine/three/CityModel";
import { CameraRig3D, orbit } from "../engine/camera/CameraRig3D";
import { Finish, SafeAreaGuide } from "../engine/layers/Finish";
import { EASE } from "../theme/tokens";

// Uji 3D ringan: maket kota rekonstruksi. Kamera berputar sambil turun
// (spiral) mendekati gedung beraksen — dari "kota ini" ke "gedung ini".
// Gedung penghalang otomatis menjadi transparan.
export const ThreeLab: React.FC = () => {
  const buildings = useMemo(() => cityLayout({ accent: [[9, 6]] }), []);
  const target = buildings.find((b) => b.accent)!;
  const subject: [number, number, number] = [
    target.x,
    target.h * 0.5,
    target.z,
  ];
  const path = orbit({
    target: subject,
    // Gedung yang menghalangi pandangan ke sasaran otomatis transparan
    // (CityModel `subject`), jadi kamera boleh turun rendah dan dekat.
    radius: [16, 6],
    height: [12, 3.5],
    fromDeg: -30,
    toDeg: 55,
    startFrame: 0,
    endFrame: 179,
    ease: EASE.inOut,
  });
  return (
    <AbsoluteFill>
      <Stage3D background="#10151c" fog={[10, 34]}>
        <hemisphereLight args={["#d8dde6", "#1a1410", 0.9]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.6}
          color="#ffe2b8"
        />
        <CameraRig3D path={path} />
        <CityModel buildings={buildings} subject={subject} cameraPath={path} />
      </Stage3D>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
