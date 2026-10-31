import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { geoGraticule, geoPath } from "d3-geo";
import { useCamera } from "../camera/Camera2D";
import { progress } from "../animation/motion";
import { COLORS, EASE } from "../../theme/tokens";
import { ASSETS } from "../../assets/registry";
import { FONTS } from "../../theme/fonts";
import { MAP_HEIGHT, MAP_WIDTH, geo, projection, useStaticJson, type LonLat, type Region } from "./geo";

const path = geoPath(projection);

// Peta dasar wilayah. Diletakkan di dalam <Layer> sebuah <Camera2D>; garis pantai
// dan grid dijaga setebal konstan di layar berapa pun zoom kamera.
// `highlight`: kode ISO negara yang ditonjolkan (mis. ["IDN"]).
export const GeoMap: React.FC<{ highlight?: string[] }> = ({ highlight = [] }) => {
  const region = useStaticJson<Region>(ASSETS["geo-region"].path);
  const cam = useCamera();
  const shapes = useMemo(
    () => region?.features.map((f) => ({ iso: f.properties.iso, d: path(f) ?? "" })) ?? [],
    [region],
  );
  const grid = useMemo(() => path(geoGraticule().step([5, 5])()) ?? "", []);
  const px = 1 / cam.zoom;
  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      <rect x={-MAP_WIDTH} y={-MAP_HEIGHT} width={MAP_WIDTH * 3} height={MAP_HEIGHT * 3} fill={COLORS.night} />
      <path d={grid} fill="none" stroke={COLORS.steel} strokeWidth={1.5 * px} opacity={0.6} />
      {shapes.map((s) => {
        // Tanpa highlight: semua negara bernada sedang. Dengan highlight: yang
        // disorot terang, sisanya meredup agar mata langsung tertuju.
        const on = highlight.length === 0 || highlight.includes(s.iso);
        return (
          <path
            key={s.iso}
            d={s.d}
            fill={on ? "#4a5970" : "#1a2029"}
            stroke={on ? "#aab4c3" : "#2c3440"}
            strokeWidth={(on ? 2 : 1.2) * px}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};

// Rute bergaris lengkung antartitik, digambar bertahap dengan kepala bergerak.
// `bend` > 0 melengkung ke kiri arah perjalanan, < 0 ke kanan.
export const GeoRoute: React.FC<{
  points: LonLat[];
  start: number;
  duration: number;
  color?: string;
  width?: number;
  bend?: number;
  dashed?: boolean;
}> = ({ points, start, duration, color = COLORS.accent, width = 6, bend = 0.2, dashed = false }) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  // Sampel kurva Bezier kuadrat untuk tiap segmen → polyline + panjang kumulatif.
  const { d, samples, lengths } = useMemo(() => {
    const pts = points.map(geo);
    const out: [number, number][] = [pts[0]];
    let dStr = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2 - (y1 - y0) * bend;
      const cy = (y0 + y1) / 2 + (x1 - x0) * bend;
      dStr += ` Q${cx},${cy} ${x1},${y1}`;
      for (let s = 1; s <= 24; s++) {
        const t = s / 24;
        out.push([
          (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
          (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
        ]);
      }
    }
    const lens = [0];
    for (let i = 1; i < out.length; i++) {
      lens.push(lens[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    }
    return { d: dStr, samples: out, lengths: lens };
  }, [points, bend]);

  const p = progress(frame, start, duration, EASE.inOut);
  if (frame < start) return null;
  const total = lengths[lengths.length - 1];
  const target = p * total;
  let i = lengths.findIndex((l) => l >= target);
  if (i <= 0) i = 1;
  const segT = (target - lengths[i - 1]) / Math.max(1e-6, lengths[i] - lengths[i - 1]);
  const head = [
    samples[i - 1][0] + (samples[i][0] - samples[i - 1][0]) * segT,
    samples[i - 1][1] + (samples[i][1] - samples[i - 1][1]) * segT,
  ];
  const px = 1 / cam.zoom;
  return (
    <svg width={MAP_WIDTH} height={MAP_HEIGHT} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* Garis dasar putus-putus menunjukkan rute utuh secara samar */}
      <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={width * 0.6 * px} strokeDasharray={dashed ? `${12 * px} ${10 * px}` : undefined} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width * px}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - p}
      />
      {p < 1 ? <circle cx={head[0]} cy={head[1]} r={width * 1.6 * px} fill={COLORS.white} /> : null}
    </svg>
  );
};

// Penanda lokasi dengan denyut. Ukurannya konstan di layar.
export const MapPin: React.FC<{
  at: LonLat;
  start: number;
  color?: string;
  label?: string;
  // Posisi label relatif terhadap pin.
  side?: "right" | "left" | "top" | "bottom";
}> = ({ at, start, color = COLORS.accent, label, side = "right" }) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const [x, y] = geo(at);
  const p = progress(frame, start, 12, EASE.cinematic);
  const pulse = ((frame - start) % 45) / 45;
  if (frame < start) return null;
  const labelPos: Record<string, React.CSSProperties> = {
    right: { left: 34, top: "50%", translate: "0 -50%" },
    left: { right: 34, top: "50%", translate: "0 -50%" },
    top: { bottom: 34, left: "50%", translate: "-50% 0" },
    bottom: { top: 34, left: "50%", translate: "-50% 0" },
  };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, scale: 1 / cam.zoom }}>
      <div style={{ position: "absolute", left: -40, top: -40, width: 80, height: 80, borderRadius: "50%", border: `4px solid ${color}`, scale: 0.3 + pulse * 1.2, opacity: (1 - pulse) * p }} />
      <div style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: "50%", background: color, border: `4px solid ${COLORS.white}`, scale: p }} />
      {label ? (
        <div
          style={{
            position: "absolute",
            ...labelPos[side],
            whiteSpace: "nowrap",
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 46,
            color: COLORS.white,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            opacity: progress(frame, start + 6, 12),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

// Label wilayah (laut, pulau) — huruf renggang, ukuran konstan di layar.
export const MapLabel: React.FC<{ at: LonLat; text: string; start?: number; end?: number; size?: number }> = ({
  at,
  text,
  start = 0,
  end,
  size = 34,
}) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const [x, y] = geo(at);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, scale: 1 / cam.zoom }}>
      <div
        style={{
          position: "absolute",
          translate: "-50% -50%",
          whiteSpace: "nowrap",
          fontFamily: FONTS.mono,
          fontSize: size,
          letterSpacing: size * 0.35,
          color: COLORS.fog,
          opacity: progress(frame, start, 15) * (end === undefined ? 1 : 1 - progress(frame, end, 15)),
        }}
      >
        {text}
      </div>
    </div>
  );
};
