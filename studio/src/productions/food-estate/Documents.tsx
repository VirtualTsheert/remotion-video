import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { At, Camera2D, Layer, key } from "../../engine/camera/Camera2D";
import { Place } from "../../engine/objects/Place";
import { Paper, TypedDocument } from "../../engine/objects/Paper";
import { Highlight, Stamp, Typewriter } from "../../engine/objects/Marks";
import { Counter } from "../../engine/graphics/Network";
import { progress } from "../../engine/animation/motion";
import { Finish, SafeAreaGuide } from "../../engine/layers/Finish";
import { COLORS, EASE } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";
import { BLOCKS, BLOCKS_TOTAL } from "./data";
import { SourceTag } from "./ui";

const Desk: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: -800,
      top: -800,
      width: 3200,
      height: 4400,
      background:
        "repeating-linear-gradient(91deg, rgba(0,0,0,0.13) 0 3px, transparent 3px 46px), linear-gradient(180deg, #33251a, #22180f)",
    }}
  />
);

// Rekonstruksi halaman judul: hanya nomor & judul resmi yang ditampilkan, tidak
// mengarang isi pasal. Teks lengkap: peraturan.bpk.go.id.
const Keppres82: React.FC<{ highlightAt?: number }> = ({
  highlightAt = 9999,
}) => (
  <TypedDocument
    width={820}
    height={1060}
    heading="KEPUTUSAN PRESIDEN REPUBLIK INDONESIA"
  >
    {/* Nomor adalah informasi kunci: dicetak besar, bukan di pojok. */}
    <div style={{ textAlign: "center", fontSize: 58, lineHeight: 1.2 }}>
      NOMOR 82 TAHUN 1995
    </div>
    <div
      style={{
        textAlign: "center",
        fontSize: 44,
        lineHeight: 1.45,
        marginTop: 40,
      }}
    >
      TENTANG
      <br />
      PENGEMBANGAN <Highlight start={highlightAt}>LAHAN GAMBUT</Highlight>
      <br />
      UNTUK PERTANIAN TANAMAN PANGAN
      <br />
      DI KALIMANTAN TENGAH
    </div>
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 60,
        fontFamily: FONTS.mono,
        fontSize: 24,
        color: COLORS.steel,
      }}
    >
      Rekonstruksi halaman judul · teks lengkap: peraturan.bpk.go.id
    </div>
  </TypedDocument>
);

// Diagram batang lima blok eks-PLG (UGM, Safrudin 2020).
const BlockChart: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...BLOCKS.map((b) => b.ha));
  return (
    <Paper width={820} height={860} tone="fresh">
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 30,
          letterSpacing: 4,
          color: COLORS.steel,
        }}
      >
        LUAS BLOK EKS-PLG
      </div>
      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {BLOCKS.map((b, i) => {
          const p = progress(frame, start + i * 8, 24, EASE.inOut);
          return (
            <div
              key={b.name}
              style={{ display: "flex", alignItems: "center", gap: 20 }}
            >
              <div
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontFamily: FONTS.sans,
                  fontWeight: 800,
                  fontSize: 44,
                  whiteSpace: "nowrap",
                  color: COLORS.ink,
                }}
              >
                Blok {b.name}
              </div>
              <div
                style={{
                  height: 46,
                  width: `${(b.ha / max) * 48 * p}%`,
                  background: COLORS.sepia,
                }}
              />
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 30,
                  color: COLORS.ink,
                  opacity: p,
                }}
              >
                {b.ha.toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 34,
          borderTop: `3px solid ${COLORS.ink}`,
          paddingTop: 16,
          fontFamily: FONTS.serif,
          fontWeight: 900,
          fontSize: 72,
          color: COLORS.ink,
        }}
      >
        <Counter
          to={BLOCKS_TOTAL}
          start={start + 40}
          duration={45}
          suffix=" ha"
        />
      </div>
    </Paper>
  );
};

// 4 · KEPPRES — dokumen dasar hukum, lalu kamera turun ke data luas blok.
export const Keppres: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background="#1a1410"
      handheld={{ amount: 4, rotate: 0.1 }}
      keys={[
        key(0, [560, 930], 1.08),
        key(110, [560, 960], 1.14, { ease: EASE.drift }),
        key(150, [560, 2020], 1.08, { ease: EASE.inOut }),
        key(269, [560, 2040], 1.12, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <Desk />
        <At x={560} y={950}>
          <Place at={-20} rotate={-2}>
            <Keppres82 highlightAt={45} />
          </Place>
        </At>
        <At x={560} y={2040}>
          <Place at={115} from="bottom" rotate={1.5}>
            <BlockChart start={140} />
          </Place>
        </At>
      </Layer>
    </Camera2D>
    <SourceTag at={130}>Luas blok: UGM, Safrudin (2020)</SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 8 · DICABUT — dokumen yang sama distempel; keputusan pencabutan menyusul.
export const Revoked: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background="#1a1410"
      keys={[
        key(0, [560, 980], 0.84),
        key(179, [560, 1080], 0.9, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <Desk />
        <At x={560} y={950}>
          <Place at={-20} rotate={-2}>
            <div style={{ position: "relative" }}>
              <Keppres82 />
              <div style={{ position: "absolute", left: 180, top: 560 }}>
                <Stamp text="DICABUT" at={18} size={96} rotate={-14} />
              </div>
            </div>
          </Place>
        </At>
        <At x={600} y={1580}>
          <Place at={60} from="right" rotate={3}>
            <Paper width={760} height={330} tone="fresh">
              <div
                style={{
                  fontFamily: FONTS.typewriter,
                  fontSize: 50,
                  color: COLORS.ink,
                  lineHeight: 1.35,
                }}
              >
                Keppres No. 80 Tahun 1999
                <br />
                mencabut Keppres No. 82/1995
              </div>
            </Paper>
          </Place>
        </At>
      </Layer>
    </Camera2D>
    <SourceTag at={60}>peraturan.bpk.go.id</SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 9 · 2020 — dari hitam, "OKTOBER 2020" diketik; kutipan Presiden dan target luas.
export const Launch2020: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 120,
          top: 250,
          fontFamily: FONTS.mono,
          fontWeight: 600,
          fontSize: 72,
          color: COLORS.highlight,
          letterSpacing: 4,
        }}
      >
        <Typewriter text="OKTOBER 2020" start={4} charsPerSecond={18} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 120, top: 400 }}>
        <Place at={40} from="bottom" rotate={-1.5} spin={6}>
          <Paper width={880} height={620} tone="fresh" padding={56}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontWeight: 900,
                fontSize: 64,
                lineHeight: 1.15,
                color: COLORS.ink,
              }}
            >
              “Hamparannya semua datar, airnya melimpah, tanahnya subur.”
            </div>
            <div
              style={{
                marginTop: 34,
                fontFamily: FONTS.sans,
                fontWeight: 600,
                fontSize: 38,
                lineHeight: 1.35,
                color: "#3a3428",
              }}
            >
              Presiden Joko Widodo
              <br />
              Belanti Siam, Pulang Pisau · 8 Oktober 2020
            </div>
          </Paper>
        </Place>
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 120,
          top: 1110,
          display: "flex",
          gap: 40,
          opacity: progress(frame, 170, 14),
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 30,
              letterSpacing: 3,
              color: COLORS.fog,
            }}
          >
            TAHUN 2020
          </div>
          <Counter
            to={30_000}
            start={175}
            duration={40}
            suffix=" ha"
            style={{
              fontFamily: FONTS.serif,
              fontWeight: 900,
              fontSize: 80,
              whiteSpace: "nowrap",
              color: COLORS.white,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 30,
              letterSpacing: 3,
              color: COLORS.fog,
            }}
          >
            RENCANA TOTAL
          </div>
          <Counter
            to={168_000}
            start={215}
            duration={45}
            suffix=" ha"
            style={{
              fontFamily: FONTS.serif,
              fontWeight: 900,
              fontSize: 80,
              whiteSpace: "nowrap",
              color: COLORS.highlight,
            }}
          />
        </div>
      </div>
      <SourceTag at={40}>
        setkab.go.id · keterangan Presiden, 8 Oktober 2020
      </SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};

// 12 · LAPANGAN vs KLAIM — dua kartu di meja; kamera berpindah dari temuan ke klaim.
export const FieldVsClaim: React.FC = () => (
  <AbsoluteFill>
    <Camera2D
      background="#1a1410"
      handheld={{ amount: 4, rotate: 0.1 }}
      keys={[
        key(0, [560, 860], 0.92),
        key(150, [560, 900], 0.95, { ease: EASE.drift }),
        key(195, [560, 1720], 0.95, { ease: EASE.inOut }),
        key(359, [560, 1760], 0.98, { ease: EASE.drift }),
      ]}
    >
      <Layer>
        <Desk />
        <At x={560} y={900}>
          <Place at={-10} rotate={-1.5}>
            <Paper width={860} height={760} tone="aged" padding={56}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 32,
                  letterSpacing: 4,
                  color: COLORS.accent,
                }}
              >
                TEMUAN LAPANGAN
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 600,
                  fontSize: 34,
                  color: COLORS.steel,
                  marginTop: 10,
                }}
              >
                Pantau Gambut · Walhi Kalteng · BBC
                <br />
                Tewai Baru, Mar 2022 & Feb 2023
              </div>
              <div
                style={{
                  fontFamily: FONTS.typewriter,
                  fontSize: 52,
                  lineHeight: 1.5,
                  color: COLORS.ink,
                  marginTop: 40,
                }}
              >
                — <Highlight start={40}>singkong layu dan kerdil</Highlight>
                <br />—{" "}
                <Highlight start={75}>ekskavator terbengkalai</Highlight>
              </div>
            </Paper>
          </Place>
        </At>
        <At x={560} y={1720}>
          <Place at={170} from="bottom" rotate={1.5}>
            <Paper width={860} height={700} tone="fresh" padding={56}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 32,
                  letterSpacing: 4,
                  color: COLORS.steel,
                }}
              >
                KLAIM PEMERINTAH
              </div>
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontWeight: 900,
                  fontSize: 64,
                  lineHeight: 1.15,
                  color: COLORS.ink,
                  marginTop: 30,
                }}
              >
                “Kemarin 600 ha itu sudah kita tanami jagung, berhasil kan?”
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 600,
                  fontSize: 36,
                  color: "#3a3428",
                  marginTop: 30,
                }}
              >
                Mentan Andi Amran Sulaiman · 9 Januari 2024
              </div>
            </Paper>
          </Place>
        </At>
      </Layer>
    </Camera2D>
    <SourceTag>Mongabay (2023) · Liputan6, 9 Januari 2024</SourceTag>
    <Finish />
    <SafeAreaGuide />
  </AbsoluteFill>
);

// 13 · BPK — kutipan temuan audit; kamera mendekat ke kalimat kunci.
export const Bpk: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Camera2D
        background="#1a1410"
        keys={[
          key(0, [560, 880], 1.0),
          key(269, [560, 900], 1.02, { ease: EASE.drift }),
        ]}
      >
        <Layer>
          <Desk />
          <At x={560} y={960}>
            <Place at={-15} rotate={-1}>
              <Paper width={860} height={1000} tone="fresh" padding={60}>
                <div
                  style={{
                    fontFamily: FONTS.typewriter,
                    fontSize: 36,
                    color: COLORS.ink,
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  BADAN PEMERIKSA KEUANGAN RI
                  <br />
                  Laporan Hasil Pemeriksaan atas LKPP 2020
                </div>
                <div
                  style={{
                    fontFamily: FONTS.typewriter,
                    fontSize: 46,
                    lineHeight: 1.5,
                    color: COLORS.ink,
                    marginTop: 60,
                  }}
                >
                  “
                  <Highlight start={30}>
                    Permasalahan pada pelaksanaan pengolahan lahan
                  </Highlight>{" "}
                  kawasan Food Estate seluas{" "}
                  <Highlight start={60}>
                    30 ribu hektare Rp 15,2 miliar
                  </Highlight>
                  ”
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 60,
                    right: 60,
                    bottom: 50,
                    fontFamily: FONTS.mono,
                    fontSize: 24,
                    color: COLORS.steel,
                  }}
                >
                  Kutipan sebagaimana dilaporkan Katadata, 10 Desember 2021
                </div>
              </Paper>
            </Place>
          </At>
        </Layer>
      </Camera2D>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 120,
          top: 220,
          opacity: progress(frame, 110, 14),
        }}
      >
        <Counter
          to={15.2}
          decimals={1}
          prefix="Rp"
          suffix=" miliar"
          start={115}
          duration={40}
          style={{
            fontFamily: FONTS.serif,
            fontWeight: 900,
            fontSize: 100,
            color: COLORS.white,
            textShadow: "0 4px 24px rgba(0,0,0,0.8)",
          }}
        />
      </div>
      <SourceTag>BPK, LHP atas LKPP 2020 · via Katadata</SourceTag>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
