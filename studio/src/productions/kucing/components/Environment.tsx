import React from "react";
import { useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { type Pt, mix, mixColor, rand, spline } from "./geom";
import { type Daylight, FLOOR_Y, LampGlow, SunBeams, WINDOW } from "./Lighting";
import { DustParticles } from "./Particles";
import { ParallaxLayer } from "./Camera";
import { PAL } from "./palette";

// ---------------------------------------------------------------------------
// Ruang tamu yang SAMA dipakai seluruh film (konsistensi antar-adegan).
// Dunia: lebar ±4800, plafon y=0, pertemuan dinding-lantai y=1760.
//   x 180–1500  kasur        x 1760–2540 jendela + bantal duduk
//   x 2600      mangkuk      x 2900–4340 sofa, jam dinding di atasnya
//   x 4480      lampu berdiri
// Lokasi pijakan kucing (y lantai untuk <CatCharacter>):
export const SPOTS = {
  sofa: { x: 3360, y: 1482 },
  bed: { x: 1020, y: 1447 },
  cushion: { x: 2150, y: 1712 },
  rug: { x: 3560, y: 1905 },
  floor: 1880,
  bowl: { x: 2640, y: 1890 },
} as const;
export const CLOCK = { x: 3620, y: 790, r: 92 } as const;
export const LAMP = { x: 4480, y: 1000 } as const;

// ------------------------------------------------------------------ luar
const Outside: React.FC<{ d: Daylight; tod: number; birds?: number }> = ({ d, tod, birds = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const sunX = mix(2700, 1700, tod);
  const sunY = 700 - Math.sin(Math.min(1, tod / 0.85) * Math.PI) * 420 + (tod > 0.7 ? (tod - 0.7) * 2600 : 0);
  const hill = (y: number, amp: number, seed: number) => {
    const pts: Pt[] = [];
    for (let x = -1200; x <= 5200; x += 200) pts.push([x, y - (0.5 + 0.5 * noise2D(`h${seed}`, x * 0.0012, 0)) * amp]);
    return spline(pts) + ` L5200,2600 L-1200,2600 Z`;
  };
  const night = d.stars;
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={d.skyTop} />
          <stop offset="1" stopColor={d.skyBottom} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#FFF6DD" stopOpacity={0.95} />
          <stop offset="0.2" stopColor={d.sunColor} stopOpacity={0.6} />
          <stop offset="1" stopColor={d.sunColor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-1200} y={-600} width={6400} height={3200} fill="url(#sky)" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle
          key={i}
          cx={mix(1000, 3400, rand(i + 50))}
          cy={mix(-100, 900, rand(i + 80))}
          r={1.5 + rand(i) * 2}
          fill="#FFFFFF"
          opacity={night * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i)))}
        />
      ))}
      {night > 0.1 ? <circle cx={2500} cy={420} r={38} fill="#F4EEDC" opacity={night} /> : null}
      {d.sun > 0.05 ? (
        <g opacity={Math.min(1, d.sun * 1.3)}>
          <circle cx={sunX} cy={sunY} r={420} fill="url(#sunGlow)" />
          <circle cx={sunX} cy={sunY} r={46} fill="#FFF4D8" />
        </g>
      ) : null}
      {/* awan tipis hanyut */}
      {[0, 1, 2].map((i) => {
        const cx = ((1200 + i * 900 + t * (8 + i * 4)) % 3200) + 600;
        const cy = 380 + i * 170;
        return (
          <g key={i} opacity={0.55 * (1 - night)}>
            <ellipse cx={cx} cy={cy} rx={260} ry={34} fill={mixColor("#FFFFFF", d.skyBottom, 0.3)} />
            <ellipse cx={cx + 80} cy={cy - 24} rx={150} ry={34} fill={mixColor("#FFFFFF", d.skyBottom, 0.2)} />
          </g>
        );
      })}
      <path d={hill(1250, 260, 1)} fill={mixColor(d.skyBottom, PAL.evening, 0.55)} opacity={0.75} />
      <path d={hill(1430, 200, 2)} fill={mixColor(mixColor("#6F8A6A", PAL.evening, 0.4), d.skyTop, night * 0.6)} />
      {/* pepohonan & rumah tetangga */}
      {[1500, 1780, 2250, 2600, 2950, 3300].map((x, i) => (
        <g key={x}>
          <rect x={x - 10} y={1420} width={20} height={300} fill="#3E3328" />
          <circle cx={x} cy={1380 - (i % 2) * 60} r={130 + (i % 3) * 30} fill={mixColor("#5E7652", "#1E2633", night)} />
          <circle cx={x + 60} cy={1330 - (i % 2) * 60} r={90} fill={mixColor("#6E8A5C", "#232C3A", night)} />
        </g>
      ))}
      <g>
        <rect x={2000} y={1380} width={420} height={420} fill={mixColor("#D8C2A2", "#2B3242", night)} />
        <path d="M1960,1390 L2210,1230 L2460,1390 Z" fill={mixColor("#9A5B3E", "#22293A", night)} />
        {[2060, 2290].map((x) => (
          <rect key={x} x={x} y={1460} width={70} height={90} fill={night > 0.3 ? "#F6C97A" : "#6F7F92"} opacity={0.9} />
        ))}
      </g>
      <rect x={-1200} y={1640} width={6400} height={60} fill={mixColor("#8E7A5C", "#2A2F3A", night)} />
      {/* burung (adegan melihat jendela) */}
      {birds > 0
        ? [0, 1, 2].map((i) => {
            const bx = 2700 - ((t * 120 + i * 140) % 1600);
            const by = 760 + i * 50 + Math.sin(t * 2 + i) * 30;
            const flap = Math.sin(t * 14 + i * 2) * 14;
            return (
              <path
                key={i}
                d={`M${bx - 22},${by + flap} Q${bx - 10},${by - 4} ${bx},${by + 4} Q${bx + 10},${by - 4} ${bx + 22},${by + flap}`}
                stroke="#3A3530"
                strokeWidth={4}
                fill="none"
                opacity={birds}
              />
            );
          })
        : null}
    </g>
  );
};

// ------------------------------------------------------------------ dinding
const WallClock: React.FC<{ hours: number }> = ({ hours }) => {
  const { x, y, r } = CLOCK;
  const hAng = (hours % 12) * 30;
  const mAng = (hours % 1) * 360;
  return (
    <g>
      <circle cx={x + 8} cy={y + 12} r={r + 6} fill="#000" opacity={0.12} />
      <circle cx={x} cy={y} r={r + 8} fill={PAL.darkBrown} />
      <circle cx={x} cy={y} r={r} fill="#F6EEDD" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            x1={x + Math.sin(a) * r * 0.8}
            y1={y - Math.cos(a) * r * 0.8}
            x2={x + Math.sin(a) * r * 0.92}
            y2={y - Math.cos(a) * r * 0.92}
            stroke={PAL.darkBrown}
            strokeWidth={i % 3 === 0 ? 5 : 2.5}
          />
        );
      })}
      <line x1={x} y1={y} x2={x} y2={y - r * 0.5} stroke={PAL.darkBrown} strokeWidth={7} strokeLinecap="round" transform={`rotate(${hAng} ${x} ${y})`} />
      <line x1={x} y1={y} x2={x} y2={y - r * 0.78} stroke={PAL.darkBrown} strokeWidth={4} strokeLinecap="round" transform={`rotate(${mAng} ${x} ${y})`} />
      <circle cx={x} cy={y} r={6} fill="#B5533C" />
    </g>
  );
};

const Curtain: React.FC<{ x: number; w: number; sway: number; flip?: boolean }> = ({ x, w, sway, flip }) => {
  const folds = 5;
  return (
    <g>
      <defs>
        <linearGradient id={`curt${x}`} x1="0" y1="0" x2="1" y2="0">
          {Array.from({ length: folds * 2 + 1 }, (_, i) => (
            <stop key={i} offset={i / (folds * 2)} stopColor={i % 2 === 0 ? "#E9D7B4" : "#C7AE86"} />
          ))}
        </linearGradient>
      </defs>
      <path
        d={`M${x},300 L${x + w},300 L${x + w + (flip ? -1 : 1) * sway * 0.4},1745 Q${x + w / 2},${1765 + sway * 0.2} ${x - (flip ? -1 : 1) * sway * 0.2},1745 Z`}
        fill={`url(#curt${x})`}
      />
    </g>
  );
};

const Wall: React.FC<{ d: Daylight; clockHours: number }> = ({ d, clockHours }) => {
  const frame = useCurrentFrame();
  const { x0, x1, y0, y1 } = WINDOW;
  const sway = noise2D("curtain", frame / 90, 0) * 18;
  const wall = `M-1400,-400 H6400 V${FLOOR_Y} H-1400 Z M${x0},${y0} V${y1} H${x1} V${y0} Z`;
  return (
    <g>
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CDBB9F" />
          <stop offset="0.45" stopColor="#E8D9C0" />
          <stop offset="1" stopColor="#E3D0B2" />
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8E6A4B" />
          <stop offset="1" stopColor="#6B4C34" />
        </linearGradient>
        <radialGradient id="windowSpill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={d.sunColor} stopOpacity={0.35 * d.sun} />
          <stop offset="1" stopColor={d.sunColor} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.12} />
          <stop offset="0.3" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0.08} />
          <stop offset="0.62" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={wall} fill="url(#wallGrad)" fillRule="evenodd" />
      {/* tekstur wallpaper garis halus */}
      {Array.from({ length: 70 }, (_, i) => {
        const x = -1400 + i * 110;
        if (x > x0 - 40 && x < x1 + 40) return null;
        return <rect key={i} x={x} y={-400} width={3} height={1650} fill="#B9A585" opacity={0.18} />;
      })}
      {/* panel bawah (wainscoting) */}
      <rect x={-1400} y={1240} width={x0 - 1400 + 1400 - 40} height={520} fill="#CDB591" opacity={0.55} />
      <rect x={x1 + 40} y={1240} width={6400 - x1} height={520} fill="#CDB591" opacity={0.55} />
      <rect x={-1400} y={1232} width={7800} height={14} fill="#BFA47C" />
      <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={1300} ry={1000} fill="url(#windowSpill)" />
      {/* kusen jendela */}
      <g>
        <rect x={x0 - 34} y={y0 - 34} width={x1 - x0 + 68} height={y1 - y0 + 50} fill="none" stroke="#F2E9D9" strokeWidth={34} />
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#glass)" />
        <rect x={(x0 + x1) / 2 - 12} y={y0} width={24} height={y1 - y0} fill="#EEE3D0" />
        <rect x={x0} y={y0 + (y1 - y0) * 0.38} width={x1 - x0} height={20} fill="#EEE3D0" />
        <rect x={x0 - 60} y={y1} width={x1 - x0 + 120} height={26} fill="#E4D6BF" />
        <rect x={x0 - 60} y={y1 + 24} width={x1 - x0 + 120} height={8} fill="#000" opacity={0.12} />
      </g>
      <rect x={1600} y={286} width={1100} height={14} rx={7} fill={PAL.darkBrown} />
      <Curtain x={1630} w={150} sway={sway} />
      <Curtain x={2520} w={150} sway={-sway} flip />
      {/* lantai kayu */}
      <rect x={-1400} y={FLOOR_Y} width={7800} height={1000} fill="url(#floorGrad)" />
      {Array.from({ length: 64 }, (_, i) => {
        const xa = -1400 + i * 125;
        const vp = 2600;
        const xb = vp + (xa - vp) * 1.9;
        return <line key={i} x1={xa} y1={FLOOR_Y} x2={xb} y2={2760} stroke="#4E3726" strokeWidth={2} opacity={0.35} />;
      })}
      {[1860, 1990, 2160, 2400].map((y, i) => (
        <line key={y} x1={-1400} x2={6400} y1={y} y2={y} stroke="#4E3726" strokeWidth={1.5} opacity={0.12 + i * 0.03} />
      ))}
      <rect x={-1400} y={FLOOR_Y - 34} width={7800} height={34} fill="#D8C6A6" />
      <rect x={-1400} y={FLOOR_Y} width={7800} height={30} fill="#000" opacity={0.18} />
      {/* bingkai foto di atas kasur */}
      <g>
        <rect x={470} y={640} width={280} height={360} fill={PAL.darkBrown} />
        <rect x={490} y={660} width={240} height={320} fill="#E8D8BC" />
        <path d="M490,900 Q560,800 640,860 T730,830 V980 H490 Z" fill="#9AA58A" />
        <circle cx={680} cy={740} r={30} fill="#E7B36E" />
        <rect x={810} y={720} width={220} height={220} fill={PAL.darkBrown} />
        <rect x={826} y={736} width={188} height={188} fill="#DCCBB0" />
        <path d="M850,900 Q900,780 990,900 Z" fill={PAL.orange} opacity={0.7} />
        <rect x={470} y={640} width={280} height={360} fill="#000" opacity={0.06} transform="translate(10,14)" />
      </g>
      {/* rak kecil di atas mangkuk */}
      <rect x={2740} y={1100} width={130} height={16} fill="#8C6749" />
      <rect x={2752} y={1040} width={30} height={60} fill="#C79B6B" />
      <rect x={2790} y={1050} width={22} height={50} fill="#566477" />
      <circle cx={2840} cy={1080} r={20} fill="#9AA58A" />
      <g>
        <rect x={3110} y={700} width={300} height={220} fill={PAL.darkBrown} />
        <rect x={3126} y={716} width={268} height={188} fill="#E2D2B6" />
        <path d="M3126,860 Q3200,780 3280,840 T3394,800 V904 H3126 Z" fill="#B88A5E" opacity={0.8} />
        <rect x={3880} y={680} width={200} height={260} fill={PAL.darkBrown} />
        <rect x={3894} y={694} width={172} height={232} fill="#D9C7A6" />
        <circle cx={3980} cy={790} r={46} fill={PAL.evening} opacity={0.6} />
      </g>
      <WallClock hours={clockHours} />
    </g>
  );
};

// ------------------------------------------------------------------ perabot
const Bed: React.FC = () => (
  <g>
    <ellipse cx={850} cy={1765} rx={720} ry={26} fill="#000" opacity={0.25} />
    <rect x={180} y={1070} width={70} height={690} rx={14} fill="#7A5A40" />
    <rect x={250} y={1140} width={20} height={620} fill="#5F4430" />
    <rect x={1440} y={1600} width={40} height={160} fill="#6B4E37" />
    <rect x={300} y={1600} width={40} height={160} fill="#6B4E37" />
    <rect x={250} y={1555} width={1260} height={70} rx={8} fill="#8C6749" />
    <rect x={250} y={1450} width={1250} height={115} rx={22} fill="#EFE6D6" />
    {/* bantal */}
    <path d="M270,1455 Q262,1376 330,1368 L470,1372 Q520,1380 512,1450 Z" fill="#F6EFE2" />
    <path d="M300,1450 Q300,1400 350,1394" stroke="#D8CCB6" strokeWidth={4} fill="none" />
    {/* selimut menjuntai */}
    <path
      d="M560,1442 Q760,1430 1000,1438 T1508,1444 L1515,1640 Q1460,1660 1400,1630 Q1320,1665 1240,1632 Q1150,1668 1060,1630 Q960,1664 880,1628 Q780,1660 700,1626 Q620,1650 560,1610 Z"
      fill="#7C8BA0"
    />
    <path d="M560,1442 Q760,1430 1000,1438 T1508,1444 L1508,1470 Q1000,1462 560,1470 Z" fill="#93A2B6" />
    {[700, 880, 1060, 1240, 1400].map((x) => (
      <path key={x} d={`M${x},1480 Q${x + 10},1560 ${x},1628`} stroke="#61708A" strokeWidth={6} fill="none" opacity={0.6} />
    ))}
  </g>
);

const Plant: React.FC<{ x: number; t: number }> = ({ x, t }) => {
  const leaves: [number, number, number, number][] = [
    [-120, 1230, -40, 1.1],
    [90, 1180, 30, 1.2],
    [-40, 1080, -10, 1.0],
    [140, 1340, 55, 0.9],
    [-160, 1390, -70, 0.85],
    [30, 1300, 5, 1],
  ];
  return (
    <g>
      <ellipse cx={x} cy={1765} rx={120} ry={16} fill="#000" opacity={0.25} />
      {leaves.map(([dx, y, rot, s], i) => {
        const sw = Math.sin(t * 0.6 + i) * 2;
        return (
          <g key={i} transform={`translate(${x + dx},${y}) rotate(${rot + sw}) scale(${s})`}>
            <path d={`M0,0 Q${-dx * 0.2},${(1560 - y) * 0.5} ${-dx * 0.5},${1560 - y}`} stroke="#4E5E3E" strokeWidth={6} fill="none" />
            <path d="M0,-120 C90,-110 110,20 0,90 C-110,20 -90,-110 0,-120 Z" fill={i % 2 ? "#5C7350" : "#4B6343"} />
            <path d="M0,-110 L0,80" stroke="#7D9670" strokeWidth={3} />
            {[-60, -20, 20].map((yy) => (
              <path key={yy} d={`M60,${yy} L18,${yy + 14} M-60,${yy} L-18,${yy + 14}`} stroke="#E8D9C0" strokeWidth={8} opacity={0.75} />
            ))}
          </g>
        );
      })}
      <path d={`M${x - 95},1560 L${x + 95},1560 L${x + 75},1762 L${x - 75},1762 Z`} fill="#B8714A" />
      <rect x={x - 102} y={1550} width={204} height={30} rx={8} fill="#C98457" />
      <path d={`M${x - 85},1600 L${x - 70},1760`} stroke="#000" opacity={0.1} strokeWidth={30} />
    </g>
  );
};

const Cushion: React.FC = () => (
  <g>
    <ellipse cx={2150} cy={1775} rx={300} ry={22} fill="#000" opacity={0.3} />
    <path d="M1870,1712 Q1880,1688 1950,1684 L2350,1684 Q2420,1688 2430,1712 L2428,1760 Q2150,1786 1872,1760 Z" fill="#6E7F96" />
    <path d="M1880,1700 Q2150,1676 2420,1700 Q2150,1716 1880,1700 Z" fill="#8797AD" />
    {[1960, 2060, 2160, 2260, 2350].map((x) => (
      <path key={x} d={`M${x},1712 L${x},1768`} stroke="#5A6A80" strokeWidth={3} opacity={0.6} />
    ))}
  </g>
);

export const FoodBowl: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 2} rx={78} ry={12} fill="#000" opacity={0.3} />
    <path d={`M${x - 72},${y - 42} L${x + 72},${y - 42} L${x + 55},${y} L${x - 55},${y} Z`} fill="#E9DCC6" />
    <rect x={x - 66} y={y - 28} width={132} height={9} fill={PAL.evening} opacity={0.8} />
    <ellipse cx={x} cy={y - 42} rx={72} ry={13} fill="#C9B699" />
    {Array.from({ length: 14 }, (_, i) => (
      <circle key={i} cx={x - 50 + rand(i + 3) * 100} cy={y - 44 + rand(i + 9) * 8} r={6} fill={i % 2 ? "#8C5A34" : "#A56C3E"} />
    ))}
  </g>
);

const Sofa: React.FC = () => {
  const fab = "#5E6E82";
  const hi = "#7586A0";
  const dk = "#46546A";
  return (
    <g>
      <defs>
        <linearGradient id="cushionGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.35" stopColor={fab} />
          <stop offset="1" stopColor={dk} />
        </linearGradient>
        <linearGradient id="seatGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fab} />
          <stop offset="1" stopColor="#3C4859" />
        </linearGradient>
      </defs>
      <ellipse cx={3620} cy={1770} rx={800} ry={30} fill="#000" opacity={0.3} />
      {[2990, 4250].map((x) => (
        <rect key={x} x={x} y={1680} width={26} height={82} fill="#4A3527" />
      ))}
      <rect x={2930} y={1110} width={1380} height={420} rx={60} fill={dk} />
      {[3070, 3490, 3910].map((x, i) => (
        <g key={x}>
          <rect x={x} y={1140} width={410} height={330} rx={48} fill="url(#cushionGrad)" />
          <rect x={x + 20} y={1150} width={370} height={60} rx={30} fill={hi} opacity={0.5} />
          <path d={`M${x + 30},${1440} Q${x + 205},${1460} ${x + 380},${1440}`} stroke={dk} strokeWidth={6} fill="none" opacity={0.5 + i * 0} />
        </g>
      ))}
      {/* dudukan */}
      <rect x={3040} y={1450} width={1180} height={60} rx={26} fill={hi} />
      <rect x={3040} y={1490} width={1180} height={130} rx={24} fill="url(#seatGrad)" />
      <rect x={3040} y={1440} width={1180} height={22} fill="#2E3846" opacity={0.35} />
      <line x1={3630} x2={3630} y1={1495} y2={1615} stroke={dk} strokeWidth={5} opacity={0.6} />
      <rect x={2950} y={1600} width={1360} height={84} rx={20} fill={dk} />
      {/* sandaran tangan */}
      {[2900, 4180].map((x) => (
        <g key={x}>
          <rect x={x} y={1290} width={160} height={400} rx={60} fill={fab} />
          <rect x={x + 10} y={1295} width={140} height={50} rx={25} fill={hi} />
        </g>
      ))}
      {/* selimut rajut di lengan kiri */}
      <path d="M2905,1300 Q2980,1270 3065,1305 L3075,1580 Q3040,1600 3010,1575 Q2980,1600 2950,1572 Q2915,1590 2898,1560 Z" fill="#E6D3AE" />
      {[2930, 2970, 3010, 3050].map((x) => (
        <path key={x} d={`M${x},1310 L${x + 4},1570`} stroke="#C9B48C" strokeWidth={5} opacity={0.7} />
      ))}
      {/* bantal kecil */}
      <path d="M4040,1330 Q4150,1300 4180,1360 L4170,1460 Q4080,1480 4030,1450 Z" fill="#C98F5B" />
      <path d="M4045,1360 Q4100,1390 4165,1380" stroke="#A86F42" strokeWidth={4} fill="none" />
    </g>
  );
};

const FloorLamp: React.FC<{ on: number }> = ({ on }) => (
  <g>
    <ellipse cx={LAMP.x} cy={1765} rx={90} ry={14} fill="#000" opacity={0.3} />
    <rect x={LAMP.x - 70} y={1740} width={140} height={22} rx={10} fill={PAL.darkBrown} />
    <rect x={LAMP.x - 7} y={1040} width={14} height={710} fill={PAL.darkBrown} />
    <path d={`M${LAMP.x - 90},${1060} L${LAMP.x + 90},${1060} L${LAMP.x + 60},${900} L${LAMP.x - 60},${900} Z`} fill={mixColor("#E6D6B8", "#FFE2AE", on)} />
    <path d={`M${LAMP.x - 90},${1060} L${LAMP.x + 90},${1060}`} stroke="#C9B48F" strokeWidth={6} />
  </g>
);

const Rug: React.FC = () => (
  <g>
    <path d="M2860,1800 L4380,1800 L4520,2080 L2720,2080 Z" fill="#B99A78" />
    <path d="M2900,1818 L4345,1818 L4470,2060 L2770,2060 Z" fill="none" stroke="#8C6749" strokeWidth={10} opacity={0.6} />
    <path d="M2960,1850 L4290,1850 L4380,2026 L2860,2026 Z" fill="none" stroke="#F3E7D3" strokeWidth={5} opacity={0.4} />
  </g>
);

export const YarnBall: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g>
    <ellipse cx={x} cy={y + 2} rx={36} ry={8} fill="#000" opacity={0.3} />
    <g transform={`translate(${x},${y - 30}) rotate(${rot})`}>
      <circle r={30} fill="#B5533C" />
      {[-18, -6, 6, 18].map((o) => (
        <path key={o} d={`M${-28},${o} Q0,${o - 16} 28,${o}`} stroke="#8E3C2A" strokeWidth={3} fill="none" />
      ))}
      <path d="M-20,-20 Q0,0 20,22" stroke="#D27359" strokeWidth={3} fill="none" />
    </g>
    <path d={`M${x - 20},${y - 6} Q${x - 70},${y + 10} ${x - 120},${y - 2}`} stroke="#B5533C" strokeWidth={3} fill="none" />
  </g>
);

// ------------------------------------------------------------------ rakitan
// Lapisan paralaks ruang tamu. `children` = isi bidang subjek (kucing, manusia)
// digambar di antara perabot dan sinar/debu agar cahaya ikut menyinari mereka.
export const LivingRoom: React.FC<{
  d: Daylight;
  tod: number;
  clockHours?: number;
  dust?: number;
  birds?: number;
  front?: React.ReactNode; // objek di depan subjek pada depth 1 (mis. tangan)
  children?: React.ReactNode;
  foreground?: React.ReactNode; // depth 1.35, kabur
  fgBlur?: number;
  bgBlur?: number; // depth of field: dinding & luar jendela kabur saat close-up
}> = ({ d, tod, clockHours = 9, dust = 1, birds = 0, front, children, foreground, fgBlur = 10, bgBlur = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <>
      <ParallaxLayer depth={0.35} blur={bgBlur * 1.6}>
        <Outside d={d} tod={tod} birds={birds} />
      </ParallaxLayer>
      <ParallaxLayer depth={0.97} blur={bgBlur}>
        <Wall d={d} clockHours={clockHours} />
        <LampGlow x={LAMP.x} y={LAMP.y} r={1100} k={d.lamp * 0.55} id="lampWall" />
      </ParallaxLayer>
      <ParallaxLayer depth={1}>
        <Rug />
        <Bed />
        <Plant x={1600} t={t} />
        <Cushion />
        <Sofa />
        <FloorLamp on={d.lamp} />
        <FoodBowl x={SPOTS.bowl.x} y={SPOTS.bowl.y} />
        {children}
        {front}
      </ParallaxLayer>
      <ParallaxLayer depth={1} blend="screen">
        <SunBeams d={d} id="beam" />
        <LampGlow x={LAMP.x} y={LAMP.y} r={700} k={d.lamp} id="lampNear" />
        <DustParticles
          box={[WINDOW.x0 - 200, WINDOW.y0 + 200, WINDOW.x1 + 900, 2100]}
          count={90}
          intensity={dust * Math.max(d.sun, d.lamp * 0.4)}
        />
      </ParallaxLayer>
      {foreground ? (
        <ParallaxLayer depth={1.35} blur={fgBlur}>
          {foreground}
        </ParallaxLayer>
      ) : null}
    </>
  );
};

// Daun monstera besar dekat lensa (foreground kabur → kedalaman).
export const FgLeaves: React.FC<{ x: number; y: number; s?: number; flip?: boolean; color?: string }> = ({
  x,
  y,
  s = 1,
  flip,
  color = "#33412F",
}) => {
  const frame = useCurrentFrame();
  const sw = Math.sin(frame / 50) * 2;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${sw})`}>
      {[
        [0, 0, -30, 1.3],
        [120, -160, 10, 1.0],
        [-60, -260, -60, 0.9],
      ].map(([dx, dy, r, k], i) => (
        <g key={i} transform={`translate(${dx},${dy}) rotate(${r}) scale(${k})`}>
          <path d="M0,-200 C150,-180 180,40 0,150 C-180,40 -150,-180 0,-200 Z" fill={color} />
          <path d="M0,-190 L0,140" stroke="#4C5E44" strokeWidth={5} />
        </g>
      ))}
      <path d="M0,150 Q-30,400 -60,700" stroke={color} strokeWidth={14} fill="none" />
    </g>
  );
};
