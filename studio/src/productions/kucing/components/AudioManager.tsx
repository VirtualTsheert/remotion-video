import React from "react";
import { AbsoluteFill, Sequence, getRemotionEnvironment, getStaticFiles, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { AUDIO_DIR, TRACKS, type Track, type Window } from "../data/audio";
import { VO } from "../data/script";

// Memutar semua track sesuai data/audio.ts. Komponen ini harus berada di
// lapisan waktu GLOBAL (overlay produksi), bukan di dalam adegan.

const exists = (file: string) => getStaticFiles().some((f) => f.name === `${AUDIO_DIR}/${file}`);

const voActive = (t: number) => VO.some((l) => t >= l.from - 0.15 && t <= l.to + 0.2);

const windowVolume = (w: Window, t: number) => {
  const fi = w.fadeIn ?? 0.3;
  const fo = w.fadeOut ?? 0.3;
  return interpolate(t, [w.from, w.from + fi, w.to - fo, w.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const TrackPlayer: React.FC<{ name: string; track: Track; hasVo: boolean }> = ({ name, track, hasVo }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const src = staticFile(`${AUDIO_DIR}/${track.file}`);
  if (track.hits) {
    return (
      <>
        {track.hits.map((h, i) => (
          <Sequence key={i} from={Math.round(h * fps)} durationInFrames={fps * 3} name={`${name} ${h}s`} layout="none">
            <Audio src={src} volume={track.volume} />
          </Sequence>
        ))}
      </>
    );
  }
  const windows = track.windows ?? [{ from: 0, to: durationInFrames / fps, fadeIn: 0, fadeOut: 0 }];
  return (
    <>
      {windows.map((w, i) => {
        const from = Math.round(w.from * fps);
        const dur = Math.max(1, Math.round((w.to - w.from) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`${name} ${w.from}–${w.to}s`} layout="none">
            <Audio
              src={src}
              loop={track.loop}
              volume={(f) => {
                const t = w.from + f / fps;
                // Ducking halus: rata-rata 0,5 dtk agar tidak "memompa".
                let duck = 1;
                if (hasVo && track.duckUnderVo !== undefined) {
                  let s = 0;
                  for (let k = -7; k <= 7; k++) s += voActive(t + k / fps) ? 1 : 0;
                  duck = 1 - (1 - track.duckUnderVo) * (s / 15);
                }
                return track.volume * (w.volume ?? 1) * windowVolume(w, t) * duck;
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};

export const AudioManager: React.FC = () => {
  const hasVo = exists(TRACKS.voiceover.file);
  const entries = Object.entries(TRACKS);
  const missing = entries.filter(([, t]) => !exists(t.file)).map(([, t]) => t.file);
  return (
    <>
      {entries.map(([name, track]) =>
        exists(track.file) ? <TrackPlayer key={name} name={name} track={track} hasVo={hasVo} /> : null,
      )}
      {/* Pengingat hanya di Studio: file audio yang belum ada. */}
      {getRemotionEnvironment().isStudio && missing.length > 0 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 20,
              padding: "8px 12px",
              background: "rgba(0,0,0,0.55)",
              color: "#FFD9A0",
              font: "600 20px sans-serif",
              borderRadius: 8,
            }}
          >
            Audio belum ada: {missing.join(", ")}
          </div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};
