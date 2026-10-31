import React from "react";
import { AbsoluteFill } from "remotion";
import { asset } from "../assets/registry";
import { At, Camera2D, Layer, key } from "../engine/camera/Camera2D";
import { Place } from "../engine/objects/Place";
import { Newspaper, PhotoPrint, TypedDocument } from "../engine/objects/Paper";
import { CircleMark, Highlight, Stamp, Typewriter } from "../engine/objects/Marks";
import { Finish, SafeAreaGuide } from "../engine/layers/Finish";
import { EASE } from "../theme/tokens";

// Uji Camera2D + animasi objek di "meja investigasi".
// Alur kamera: lebar (konteks) → dorong ke dokumen (bukti) → geser ke foto (orang).
// Semua isi adalah CONTOH untuk pengujian, bukan materi sejarah.
export const DeskLab: React.FC = () => {
  return (
    <AbsoluteFill>
      <Camera2D
        background="#1a1410"
        handheld={{ amount: 5, rotate: 0.15 }}
        keys={[
          key(0, [1100, 1650], 0.52),
          key(60, [1100, 1600], 0.56, { ease: EASE.drift }),
          key(105, [760, 1230], 1.05),
          key(150, [760, 1300], 1.12, { ease: EASE.drift }),
          key(190, [1460, 2080], 1.25),
          key(239, [1470, 2100], 1.35, { ease: EASE.drift }),
        ]}
      >
        <Layer>
          {/* Permukaan meja kayu */}
          <div
            style={{
              position: "absolute",
              left: -600,
              top: -800,
              width: 3400,
              height: 5000,
              background:
                "repeating-linear-gradient(92deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 40px), linear-gradient(180deg, #3b2a1d, #2a1d14)",
            }}
          />
          <At x={1550} y={1000}>
            {/* at negatif: koran sudah tergeletak sejak frame pertama (thumbnail tidak kosong) */}
            <Place at={-30} from="right" rotate={6}>
              <Newspaper masthead="HARIAN CONTOH" date="SENIN, 1 JANUARI 1900 · NO. 1" headline="Judul Berita Contoh untuk Uji Tata Letak" deck="Isi halaman ini hanya contoh visual" />
            </Place>
          </At>
          <At x={760} y={1300}>
            <Place at={18} from="left" rotate={-3}>
              <TypedDocument heading="LAPORAN CONTOH" reference="No. 000/LAB/1900">
                <div style={{ minHeight: 120 }}>
                  <Typewriter text="Dokumen ini dipakai untuk menguji animasi mesin tik." start={88} charsPerSecond={40} />
                </div>
                <p>
                  Kalimat penting dapat <Highlight start={125}>ditandai dengan stabilo</Highlight> agar penonton tahu
                  bagian mana yang menjadi bukti.
                </p>
                <div style={{ position: "absolute", right: 70, bottom: 120 }}>
                  <Stamp text="RAHASIA" at={140} />
                </div>
              </TypedDocument>
            </Place>
          </At>
          <At x={1470} y={2100}>
            <Place at={36} from="bottom" rotate={4}>
              <div style={{ position: "relative" }}>
                <PhotoPrint src={asset("lab-street-photo")} width={560} height={700} caption="foto contoh" />
                <div style={{ position: "absolute", left: 420, top: 460 }}>
                  <CircleMark width={220} height={300} start={200} />
                </div>
              </div>
            </Place>
          </At>
        </Layer>
      </Camera2D>
      <Finish />
      <SafeAreaGuide />
    </AbsoluteFill>
  );
};
