import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { CinematicCamera } from "../components/Camera";
import { CatCharacter } from "../components/CatCharacter";
import { POSES, poseTrack } from "../components/CatAnimation";
import { LivingRoom, SPOTS } from "../components/Environment";
import { Grade, daylight } from "../components/Lighting";
import { formatId } from "../components/Typography";
import { DayRing, SLEEP, TimelineVisualization } from "../components/Timeline";
import { FONTS } from "../../../theme/fonts";
import { clamp } from "../../../theme/tokens";
import { CUES, FACTS, sleepYears } from "../data/script";
import { at } from "../data/scenes";
import { rand } from "../components/geom";

// SCENE 3 — SKALA SEUMUR HIDUP (31–53,5 dtk)
// Kamera menjauh dari kucing yang tidur di dekat jendela; ruangan larut ke
// ruang malam abstrak. Kucing tetap di tengah sebagai jangkar, dikelilingi
// lingkaran 24 jam. Kalender tahunan membalik 1→15 (kucing tumbuh dari anak),
// lalu garis hidup 15 tahun terisi: 7,5 tahun → 10 tahun tidur.
const S = "S3-SeumurHidup" as const;
const DUR = 675;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

const c = {
  years: at(S, CUES.lifetime15),
  h12: at(S, CUES.hours12),
  y75: at(S, CUES.years75),
  h16: at(S, CUES.hours16),
  y10: at(S, CUES.years10),
  third: at(S, CUES.twoThirds),
};

const Bokeh: React.FC<{ t: number; drift: number }> = ({ t, drift }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {Array.from({ length: 26 }, (_, i) => {
      const depth = 0.3 + rand(i + 1) * 0.9;
      const x = rand(i + 7) * 1280 - 100 + drift * depth * 120 + noise2D(`b${i}`, t * 0.05, 0) * 40;
      const y = rand(i + 13) * 2000 - 40 + noise2D(`c${i}`, 0, t * 0.05) * 40;
      const r = 20 + depth * 70;
      return (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#F8D89A" : "#9FB2D0"} opacity={0.05 + depth * 0.06} style={{ filter: `blur(${4 + depth * 8}px)` }} />
      );
    })}
  </svg>
);

const Headline: React.FC<{ show: [number, number]; big: string; small: string; color?: string }> = ({ show, big, small, color = "#F8F1E4" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [show[0], show[0] + 20], [0, 1], { ...clamp, easing: OUT });
  const o = interpolate(frame, [show[1] - 12, show[1]], [1, 0], clamp);
  if (frame < show[0] || frame > show[1]) return null;
  return (
    <div style={{ position: "absolute", top: 240, left: 0, right: 0, textAlign: "center", opacity: p * o }}>
      <div
        style={{
          fontFamily: FONTS.serif,
          fontWeight: 900,
          fontSize: 150,
          lineHeight: 1,
          color,
          transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
          filter: `blur(${(1 - p) * 6}px)`,
          textShadow: "0 6px 40px rgba(0,0,0,0.45)",
          fontVariantNumeric: "lining-nums tabular-nums",
        }}
      >
        {big}
      </div>
      <div style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: 40, letterSpacing: "0.3em", color: "#F3E7D3", opacity: 0.85, marginTop: 18 }}>
        {small}
      </div>
    </div>
  );
};

export const Scene03Lifetime: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const d = daylight(1);
  const cush = SPOTS.cushion;

  // --- bagian 1: dolly out dari ruangan, lalu larut ke ruang grafik
  const roomOut = interpolate(frame, [40, 100], [1, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const gfxIn = interpolate(frame, [55, 110], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

  // --- angka
  const calYear = Math.round(interpolate(frame, [70, c.years], [1, FACTS.lifespanYears], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) }));
  const ringHours = interpolate(frame, [c.h12 - 10, c.h12 + 30, c.h16 - 10, c.h16 + 30], [0, FACTS.sleepLow, FACTS.sleepLow, FACTS.sleepHigh], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const lifeSleep = interpolate(frame, [c.y75 - 10, c.y75 + 50, c.y10 - 10, c.y10 + 45], [0, sleepYears(12), sleepYears(12), sleepYears(16)], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const reveal = interpolate(frame, [70, c.years], [0, 1], clamp);
  const ringIn = interpolate(frame, [c.h12 - 30, c.h12], [0, 1], { ...clamp, easing: OUT });
  const third = interpolate(frame, [c.third, c.third + 25], [0, 1], { ...clamp, easing: OUT });
  const growth = interpolate(frame, [70, c.years], [0.55, 0.92], clamp);
  const push = interpolate(frame, [100, DUR], [1, 1.06], clamp);
  const drift = interpolate(frame, [0, DUR], [-0.6, 0.6]);
  const catPose = poseTrack([{ frame: 0, pose: "curl", set: { headR: 30 } }, { frame: 600, pose: "curl", set: { ear: -14 } }, { frame: DUR, pose: "curl" }], frame);
  const ringLabel = frame < c.h16 ? `${FACTS.sleepLow} JAM TIDUR / HARI` : `${FACTS.sleepHigh} JAM TIDUR / HARI`;
  const labelO = interpolate(frame, [c.h12, c.h12 + 15, c.h16 - 8, c.h16, c.h16 + 6, c.h16 + 20], [0, 1, 1, 0, 0, 1], clamp);
  const lifeIn = interpolate(frame, [60, 90], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#141A26" }}>
      {roomOut > 0 ? (
        <AbsoluteFill style={{ opacity: roomOut }}>
          <CinematicCamera
            anchor={[cush.x, cush.y]}
            keys={[
              { frame: 0, x: cush.x - 30, y: cush.y - 90, zoom: 1.7 },
              { frame: 110, x: cush.x, y: cush.y - 400, zoom: 0.95, ease: Easing.bezier(0.4, 0, 0.6, 1) },
            ]}
          >
            <LivingRoom d={d} tod={1} clockHours={2} dust={0.2} bgBlur={2}>
              <CatCharacter id="s3room" pose={POSES.curl} x={cush.x} y={cush.y} seed={6} light={{ rim: 0.4, tint: [0.82, 0.86, 1] }} />
            </LivingRoom>
          </CinematicCamera>
          <Grade ambient={d.ambient} vignette={0.7} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ opacity: gfxIn }}>
        <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 45%, #2A3348 0%, #182030 55%, #0E121B 100%)" }} />
        <Bokeh t={t} drift={drift} />
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          {/* kalender tahunan */}
          {frame < c.years + 8 ? (
            <div style={{ position: "absolute", top: 230, left: 340, width: 400, height: 300, perspective: 900, opacity: interpolate(frame, [c.years - 4, c.years + 8], [1, 0], clamp) }}>
              <div style={{ position: "absolute", inset: 0, background: "#F3E7D3", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 64, background: "#B5533C", borderRadius: "18px 18px 0 0" }} />
              <div style={{ position: "absolute", top: 76, width: "100%", textAlign: "center", fontFamily: FONTS.sans, fontWeight: 600, fontSize: 34, letterSpacing: "0.25em", color: "#8C6749" }}>
                TAHUN KE
              </div>
              <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontFamily: FONTS.serif, fontWeight: 900, fontSize: 150, color: "#38291F", lineHeight: 1.1, fontVariantNumeric: "lining-nums" }}>
                {calYear}
              </div>
              {/* halaman yang sedang terbalik */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#E8D8BC",
                  borderRadius: 18,
                  transformOrigin: "50% 0%",
                  transform: `rotateX(${(((frame - 70) % 9) / 9) * 95}deg)`,
                  opacity: frame > 70 && frame < c.years ? 0.5 * (1 - ((frame - 70) % 9) / 9) : 0,
                }}
              />
            </div>
          ) : null}
          <Headline show={[c.years, c.y75 - 8]} big={`${FACTS.lifespanYears} TAHUN`} small="KEHIDUPAN KUCING" />
          <Headline show={[c.y75, c.y10 - 4]} big={`${formatId(Math.min(lifeSleep, 7.5), 1)} TAHUN`} small="DIHABISKAN UNTUK TIDUR" color="#C9D6EA" />
          <Headline show={[c.y10, c.third - 4]} big={`${formatId(Math.max(lifeSleep, 7.5), lifeSleep >= 9.99 ? 0 : 1)} TAHUN`} small="DIHABISKAN UNTUK TIDUR" color="#C9D6EA" />
          <Headline show={[c.third, DUR + 1]} big="≈ 2/3" small="HIDUPNYA UNTUK TIDUR" color="#C9D6EA" />

          {/* cincin 24 jam + kucing di tengah */}
          <div style={{ position: "absolute", top: 570, left: 540 - 230, width: 460, height: 460 }}>
            <div style={{ position: "absolute", inset: 0, opacity: ringIn, transform: `scale(${0.9 + 0.1 * ringIn}) rotate(${(1 - ringIn) * -40}deg)` }}>
              <DayRing sleepHours={ringHours} size={420} highlight={third} />
            </div>
            <svg width={460} height={460} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <CatCharacter id="s3cat" pose={catPose} x={230 - 40 * growth} y={290} scale={growth} seed={6} light={{ rim: 0.5, tint: [0.9, 0.92, 1] }} />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              top: 1040,
              width: "100%",
              textAlign: "center",
              fontFamily: FONTS.sans,
              fontWeight: 800,
              fontSize: 44,
              letterSpacing: "0.08em",
              color: SLEEP,
              opacity: labelO,
            }}
          >
            {ringLabel}
          </div>

          {/* garis hidup 15 tahun */}
          <div style={{ position: "absolute", top: 1130, left: 90, opacity: lifeIn }}>
            <TimelineVisualization years={FACTS.lifespanYears} sleepYears={lifeSleep} reveal={reveal} width={900} />
          </div>
          <div style={{ position: "absolute", top: 1305, left: 90, right: 90, display: "flex", justifyContent: "space-between", opacity: interpolate(frame, [c.y75, c.y75 + 15], [0, 0.85], clamp), fontFamily: FONTS.sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.15em" }}>
            <span style={{ color: SLEEP }}>■ TIDUR</span>
            <span style={{ color: "#E9A15E" }}>■ TERJAGA</span>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

