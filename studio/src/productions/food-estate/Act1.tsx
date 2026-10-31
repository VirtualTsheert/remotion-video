import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { Camera2D, Layer, key } from "../../engine/camera/Camera2D";
import {
  GeoImage,
  GeoMap,
  GeoRoute,
  MapLabel,
  MapPin,
} from "../../engine/graphics/GeoMap";
import { geo, imageProjection } from "../../engine/graphics/geo";
import { BeforeAfter, ImageWorld } from "../../engine/graphics/Satellite";
import { Counter } from "../../engine/graphics/Network";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";
import { progress } from "../../engine/animation/motion";
import { asset } from "../../assets/registry";
import { COLORS, EASE, clamp } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";
import { IMG, PLACE, RIVERS, SPI } from "./data";
import {
  Body,
  BottomBlock,
  Headline,
  Kicker,
  Scrim,
  SourceTag,
  TopBlock,
} from "./ui";

const spiPx = imageProjection(IMG.spi1999.bbox, IMG.spi1999.size);
const plgPx = imageProjection(IMG.plg1999.bbox, IMG.plg1999.size);

// 1 · HOOK — kamera menyusuri garis kanal saat garisnya tergambar.
// Tujuan: membuat penonton bertanya "garis apa ini?" dalam 2 detik pertama.
export const Hook: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background={COLORS.ink}
      handheld={{ amount: 3, rotate: 0.05 }}
      keys={[
        key(0, spiPx([114.07, -2.23]), 1.25),
        key(239, spiPx([114.66, -2.23]), 1.4, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <ImageWorld
          src={asset("fe-spi-1999")}
          bbox={IMG.spi1999.bbox}
          size={IMG.spi1999.size}
        >
          <GeoRoute
            points={SPI}
            start={-25}
            duration={190}
            bend={0}
            width={7}
          />
          {RIVERS.map((r) => (
            <MapLabel
              key={r.name}
              at={r.at}
              text={r.name}
              size={32}
              color={COLORS.white}
            />
          ))}
        </ImageWorld>
      </Layer>
    </Camera2D>
    <Scrim />
    <TopBlock>
      <Kicker at={-16}>KALIMANTAN TENGAH · 1999</Kicker>
      <Headline at={-16} size={150}>
        187 km
      </Headline>
      <Body at={-16}>kanal lurus menembus hutan gambut</Body>
    </TopBlock>
    <SourceTag at={-16}>
      Citra Landsat 1999 · NASA GIBS · Panjang kanal: UGM (2020)
    </SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 2 · JUDUL — di atas lahan yang sama, digelapkan.
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Img
        src={asset("fe-plg-1999")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.38) saturate(0.6)",
          scale: interpolate(frame, [0, 150], [1.12, 1.2], clamp),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 100px",
        }}
      >
        <Kicker at={4}>INVESTIGASI · PERTANIAN</Kicker>
        <div style={{ height: 28 }} />
        <Headline at={10} size={124}>
          Lahan
          <br />
          yang Sama
        </Headline>
        <div style={{ height: 36 }} />
        <Body at={30}>
          Dari proyek sejuta hektare
          <br />
          ke food estate
        </Body>
      </AbsoluteFill>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// 3 · PETA 1995 — dari Nusantara terbang masuk ke kawasan proyek (citra 1989:
// kondisi sebelum kanal). Kamera bergerak dari "di mana" ke "lahan ini".
export const Map1995: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background={COLORS.night}
      keys={[
        key(0, geo([117, -2.5]), 0.55),
        key(100, geo([114.2, -2.2]), 4, { ease: EASE.inOut }),
        key(240, geo([114.4, -2.55]), 26, { ease: EASE.inOut }),
        key(299, geo([114.4, -2.55]), 27.5, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <GeoMap highlight={["IDN"]} />
        <GeoImage src={asset("fe-plg-1989")} bbox={IMG.plg1989.bbox} />
        <MapLabel
          at={[113.6, 0.6]}
          text="KALIMANTAN"
          start={10}
          end={110}
          size={36}
        />
        <MapPin
          at={PLACE.palangkaRaya}
          start={70}
          label="Palangka Raya"
          side="left"
        />
      </Layer>
    </Camera2D>
    <Scrim />
    <TopBlock>
      <Kicker>1995</Kicker>
      <Headline at={8}>Proyek Pengembangan Lahan Gambut</Headline>
      <Body at={40}>Target: sejuta hektare untuk tanaman pangan</Body>
    </TopBlock>
    <SourceTag at={40}>
      Keppres No. 82/1995 · Citra Landsat 1989 · Peta: Natural Earth
    </SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 5 · SEBELUM/SESUDAH — wipe 1989 → 1999, lalu jejak kanal ditandai.
export const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = progress(frame, 55, 110, EASE.inOut);
  return (
    <AbsoluteFill>
      <Camera2D
        background={COLORS.ink}
        keys={[
          key(0, [900, 1575], 0.61),
          key(170, [900, 1575], 0.63, { ease: EASE.drift }),
          key(329, plgPx([114.42, -2.38]), 0.95, { ease: EASE.inOut }),
        ]}
      >
        <Layer>
          <BeforeAfter
            before={asset("fe-plg-1989")}
            after={asset("fe-plg-1999")}
            size={IMG.plg1999.size}
            start={55}
            duration={110}
          />
          <ImageWorld bbox={IMG.plg1999.bbox} size={IMG.plg1999.size}>
            <GeoRoute
              points={SPI}
              start={185}
              duration={60}
              bend={0}
              width={6}
            />
            <MapLabel
              at={[114.4, -2.29]}
              text="SALURAN PRIMER INDUK"
              start={205}
              size={34}
              color={COLORS.white}
            />
            <MapLabel
              at={[114.52, -2.45]}
              text="GRID KANAL"
              start={240}
              size={34}
              color={COLORS.white}
            />
          </ImageWorld>
        </Layer>
      </Camera2D>
      <Scrim top={0.6} bottom={0.5} />
      <TopBlock>
        <Kicker>CITRA SATELIT</Kicker>
        <div style={{ position: "relative", height: 150 }}>
          <div
            style={{
              position: "absolute",
              opacity: 1 - wipe,
              fontFamily: FONTS.mono,
              fontWeight: 600,
              fontSize: 130,
              color: COLORS.white,
            }}
          >
            1989
          </div>
          <div
            style={{
              position: "absolute",
              opacity: wipe,
              fontFamily: FONTS.mono,
              fontWeight: 600,
              fontSize: 130,
              color: COLORS.highlight,
            }}
          >
            1999
          </div>
        </div>
        <Body at={0} until={120}>
          Hutan rawa gambut yang utuh
        </Body>
      </TopBlock>
      <BottomBlock>
        <Body at={180}>Kanal-kanal lurus membelah gambut</Body>
      </BottomBlock>
      <SourceTag>Komposit Landsat tahunan 1989 & 1999 · NASA GIBS</SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// 7 · API — asap 2015 di atas Kalimantan; deret tahun kebakaran di kawasan eks-PLG;
// kerugian 2015 (nasional, Bank Dunia).
const FIRE_YEARS = ["1997", "2001", "2006", "2015", "2019"];
const smokePx = imageProjection(IMG.smoke2015.bbox, IMG.smoke2015.size);

export const Fire: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Camera2D
        background={COLORS.ink}
        keys={[
          key(0, smokePx([113.6, -1.0]), 0.8),
          key(359, smokePx([114.3, -2.4]), 1.15, { ease: EASE.drift }),
        ]}
      >
        <Layer>
          <ImageWorld
            src={asset("fe-smoke-2015")}
            bbox={IMG.smoke2015.bbox}
            size={IMG.smoke2015.size}
          >
            <MapPin
              at={[114.4, -2.55]}
              start={20}
              label="Kawasan eks-PLG"
              side="left"
            />
          </ImageWorld>
        </Layer>
      </Camera2D>
      <Scrim top={0.65} bottom={0.75} />
      <TopBlock panel>
        <Kicker>TERBAKAR BERULANG KALI</Kicker>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          {FIRE_YEARS.map((y, i) => {
            const p = progress(frame, 15 + i * 18, 12);
            const hot = y === "2015";
            return (
              <div
                key={y}
                style={{
                  fontFamily: FONTS.mono,
                  fontWeight: 600,
                  fontSize: 58,
                  color: hot ? COLORS.ink : COLORS.white,
                  background: hot ? COLORS.highlight : "rgba(8,10,14,0.55)",
                  padding: "4px 14px",
                  opacity: p,
                  scale: 0.8 + 0.2 * p,
                }}
              >
                {y}
              </div>
            );
          })}
        </div>
      </TopBlock>
      {/* Panel baru muncul bersama isinya, agar tidak tampak kotak kosong. */}
      <div style={{ opacity: progress(frame, 146, 12) }}>
        <BottomBlock panel>
          <Kicker at={150} color={COLORS.highlight}>
            KEBAKARAN 2015 · SELURUH INDONESIA
          </Kicker>
          <div style={{ opacity: progress(frame, 150, 12) }}>
            <Counter
              to={16.1}
              decimals={1}
              prefix="US$"
              suffix=" miliar"
              start={155}
              duration={50}
              style={{
                fontFamily: FONTS.serif,
                fontWeight: 900,
                fontSize: 112,
                color: COLORS.white,
              }}
            />
          </div>
          <Body at={175}>kerugian menurut Bank Dunia</Body>
        </BottomBlock>
      </div>
      <SourceTag>
        Citra MODIS Terra, 24 Sep 2015 · NASA GIBS · Tahun kebakaran: UGM (2020)
        · Bank Dunia (2016)
      </SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
