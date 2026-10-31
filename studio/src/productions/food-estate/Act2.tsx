import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Camera2D, Layer, key } from "../../engine/camera/Camera2D";
import {
  GeoImage,
  GeoMap,
  GeoRoute,
  MapLabel,
  MapPin,
} from "../../engine/graphics/GeoMap";
import { geo, imageProjection } from "../../engine/graphics/geo";
import { ImageWorld, SatelliteViewer } from "../../engine/graphics/Satellite";
import { Counter } from "../../engine/graphics/Network";
import { progress } from "../../engine/animation/motion";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";
import { asset, credits } from "../../assets/registry";
import { COLORS, EASE } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";
import { IMG, PLACE } from "./data";
import changes from "../../../public/imagery/food-estate/tewai-change.json";
import {
  Body,
  BottomBlock,
  Headline,
  Kicker,
  Scrim,
  SourceTag,
  TopBlock,
} from "./ui";

// 10 · LAHAN YANG SAMA — lokasi food estate 2020 di atas citra kawasan eks-PLG 1999.
export const SameLand: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background={COLORS.night}
      keys={[
        key(0, geo([114.2, -2.32]), 9.2),
        key(209, geo([114.22, -2.32]), 10.2, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <GeoMap highlight={["IDN"]} />
        <GeoImage
          src={asset("fe-plg-1999")}
          bbox={IMG.plg1999.bbox}
          opacity={0.9}
        />
        <MapLabel
          at={[114.4, -1.98]}
          text="KAWASAN EKS-PLG (CITRA 1999)"
          start={10}
          size={30}
          color={COLORS.white}
        />
        <MapPin
          at={PLACE.tewaiBaru}
          start={4}
          label="Gunung Mas"
          side="right"
        />
        <MapPin
          at={PLACE.palingkauJaya}
          start={12}
          label="Kapuas"
          side="right"
        />
        <MapPin
          at={PLACE.belantiSiam}
          start={20}
          label="Pulang Pisau"
          side="right"
        />
      </Layer>
    </Camera2D>
    <Scrim />
    <TopBlock>
      <Kicker>2020</Kicker>
      <Headline at={6}>Lahan yang sama</Headline>
      <Body at={30}>
        Lokasi food estate kembali berada di kawasan bekas proyek sejuta hektare
      </Body>
    </TopBlock>
    <SourceTag at={30}>
      Overlay lokasi: UGM (2020) · Pantau Gambut (2024) · Lokasi desa:
      OpenStreetMap
    </SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 11 · TEWAI BARU — penampil citra: hutan utuh → bukaan baru → overlay hasil analisis.
export const TewaiBaru: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <TopBlock>
        <Kicker>GUNUNG MAS · DEKAT DESA TEWAI BARU</Kicker>
      </TopBlock>
      <SatelliteViewer
        left={80}
        top={360}
        size={820}
        imageSize={IMG.tewai.size}
        focus={changes.center_px as [number, number]}
        zoom={[1.0, 1.7]}
        duration={389}
        sensor="HLS · SENTINEL-2"
        coordinates="1°27′LS 113°59′BT"
        frames={[
          { src: asset("fe-tewai-2020"), from: 0, label: "29 JUN 2020" },
          { src: asset("fe-tewai-2021"), from: 70, label: "23 MEI 2021" },
          { src: asset("fe-tewai-2022"), from: 140, label: "13 MEI 2022" },
          { src: asset("fe-tewai-2023"), from: 300, label: "16 AGU 2023" },
        ]}
        overlays={[
          {
            src: asset("fe-tewai-change-fill"),
            from: 175,
            opacity: 0.4,
            scan: true,
          },
          { src: asset("fe-tewai-change-outline"), from: 175, scan: true },
        ]}
      />
      <BottomBlock gap={8}>
        <Body at={200}>±{changes.area_ha} ha bukaan baru terdeteksi</Body>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 36,
            color: COLORS.fog,
            opacity: progress(frame, 220, 14),
          }}
        >
          Analisis citra Jun 2020 → Mei 2022 · Pantau Gambut: ±700 ha
        </div>
      </BottomBlock>
      <SourceTag>
        Citra HLS (Copernicus Sentinel-2) · NASA GIBS · Deteksi perubahan:
        analisis tim
      </SourceTag>
      <Finish grain={0.08} />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// 14 · SAWIT — kondisi terkini (citra 2024) di tiga desa yang disebut Pantau Gambut.
const kapuasPx = imageProjection(IMG.kapuas2024.bbox, IMG.kapuas2024.size);

export const Sawit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Camera2D
        background={COLORS.ink}
        keys={[
          key(0, kapuasPx([114.51, -2.81]), 1.95),
          key(359, kapuasPx([114.515, -2.81]), 2.1, { ease: EASE.drift }),
        ]}
      >
        <Layer>
          <ImageWorld
            src={asset("fe-kapuas-2024")}
            bbox={IMG.kapuas2024.bbox}
            size={IMG.kapuas2024.size}
          >
            <MapPin
              at={PLACE.palingkauAsri}
              start={20}
              label="Palingkau Asri"
              side="top"
            />
            <MapPin
              at={PLACE.palingkauJaya}
              start={35}
              label="Palingkau Jaya"
              side="bottom"
            />
            <MapPin
              at={PLACE.tajepan}
              start={50}
              label="Tajepan"
              side="bottom"
            />
          </ImageWorld>
        </Layer>
      </Camera2D>
      <Scrim top={0.7} bottom={0.8} />
      <TopBlock gap={6}>
        <Kicker>KAPUAS · CITRA JULI 2024</Kicker>
        <Counter
          to={274.67}
          decimals={2}
          suffix=" ha"
          start={70}
          duration={45}
          style={{
            // Disembunyikan sampai mulai berhitung (tidak menampilkan "0,00 ha").
            opacity: progress(frame, 66, 8),
            fontFamily: FONTS.serif,
            fontWeight: 900,
            fontSize: 110,
            color: COLORS.white,
            textShadow: "0 4px 24px rgba(0,0,0,0.7)",
          }}
        />
        <Body at={80}>lahan food estate menjadi kebun sawit</Body>
      </TopBlock>
      <BottomBlock gap={18}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", width: 640 }}>
          {Array.from({ length: 18 }, (_, i) => {
            const p = progress(frame, 170 + i * 4, 10);
            const palm = i >= 15;
            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  border: `6px solid ${palm ? COLORS.accent : COLORS.fog}`,
                  background: palm ? COLORS.accent : "transparent",
                  scale: p,
                }}
              />
            );
          })}
        </div>
        <Body at={250}>
          15 dari 18 titik bukaan terbengkalai · 3 menjadi sawit
        </Body>
      </BottomBlock>
      <SourceTag>
        Pantau Gambut via Mongabay, 14 Nov 2024 · Citra HLS · NASA GIBS · Lokasi
        desa: OSM
      </SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// 15 · MERAUKE — kamera mundur dari Kalimantan ke Nusantara; rute ke Papua.
export const Merauke: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background={COLORS.night}
      keys={[
        key(0, geo([114.3, -2.6]), 7),
        key(140, geo([125, -8.6]), 0.5, { ease: EASE.inOut }),
        key(329, geo([125, -8.8]), 0.53, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <GeoMap highlight={["IDN"]} />
        <MapPin
          at={[114.3, -2.6]}
          start={0}
          label="Kalimantan Tengah"
          side="top"
        />
        <GeoRoute
          points={[[114.3, -2.6], PLACE.merauke]}
          start={120}
          duration={80}
          bend={-0.15}
          dashed
        />
        <MapPin at={PLACE.merauke} start={195} label="Merauke" side="top" />
      </Layer>
    </Camera2D>
    <Scrim top={0.4} bottom={0.7} />
    <BottomBlock gap={16}>
      <Kicker at={150}>KINI · MERAUKE, PAPUA</Kicker>
      <Body at={165}>
        Rencana lumbung pangan: ratusan ribu hingga jutaan hektare
      </Body>
      <div style={{ height: 10 }} />
      <Headline at={240} size={76}>
        Lahannya berbeda.
        <br />
        Pertanyaannya tetap sama.
      </Headline>
    </BottomBlock>
    <SourceTag at={165}>Kementan (2024) · Tempo (2024)</SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 16 · SUMBER — kredit citra dibuat dari Asset Library.
const SOURCES = [
  "Keppres 82/1995 & 80/1999 — peraturan.bpk.go.id",
  "UGM, Safrudin (2020): Food Estate di Eks-PLG",
  "Setkab — keterangan Presiden, 8 Okt 2020",
  "Pantau Gambut (2022, 2024) · Mongabay (2023, 2024)",
  "BPK, LHP atas LKPP 2020 — via Katadata (2021)",
  "Bank Dunia, The Cost of Fire (2016)",
  "Liputan6, 9 Jan 2024 · Kementan · Tempo (2024)",
];

export const Sources: React.FC = () => {
  const frame = useCurrentFrame();
  const imagery = credits([
    "fe-spi-1999",
    "fe-smoke-2015",
    "fe-tewai-2022",
    "fe-tewai-change-fill",
  ]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <TopBlock gap={14}>
        <Kicker>SUMBER</Kicker>
        {[
          ...SOURCES,
          ...imagery,
          "Peta: Natural Earth · © kontributor OpenStreetMap",
        ].map((s, i) => (
          <div
            key={s}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 30,
              lineHeight: 1.35,
              color: i < SOURCES.length ? COLORS.white : COLORS.fog,
              opacity: progress(frame, 4 + i * 3, 12),
            }}
          >
            {s}
          </div>
        ))}
      </TopBlock>
      <Finish vignette={0.4} />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
