import React from "react";
import { Img } from "remotion";
import { asset } from "../../assets/registry";
import { COLORS } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

// Tekstur serat (gambar cache) + noda menguning di tepi untuk kertas tua.
const PaperSurface: React.FC<{ tone: "fresh" | "aged" }> = ({ tone }) => (
  <>
    <Img
      src={asset("texture-paper")}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply" }}
    />
    {tone === "aged" ? (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(110,80,40,0.35) 100%)" }} />
    ) : null}
  </>
);

// Selembar kertas bertekstur. Isi bebas (teks dokumen, foto, tabel).
export const Paper: React.FC<{
  width: number;
  height: number;
  tone?: "fresh" | "aged";
  padding?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ width, height, tone = "aged", padding = 64, style, children }) => (
  <div
    style={{
      width,
      height,
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
      backgroundColor: tone === "aged" ? COLORS.paperDark : COLORS.paper,
      ...style,
    }}
  >
    <PaperSurface tone={tone} />
    <div style={{ position: "relative", padding, height: "100%", boxSizing: "border-box" }}>{children}</div>
  </div>
);

// Dokumen ketik: kop, nomor, dan paragraf dengan font mesin tik.
export const TypedDocument: React.FC<{
  width?: number;
  height?: number;
  heading: string;
  reference?: string;
  children: React.ReactNode;
}> = ({ width = 760, height = 1000, heading, reference, children }) => (
  <Paper width={width} height={height}>
    {reference ? (
      <div style={{ fontFamily: FONTS.typewriter, fontSize: 28, color: COLORS.steel, textAlign: "right" }}>{reference}</div>
    ) : null}
    <div style={{ fontFamily: FONTS.typewriter, fontSize: 48, color: COLORS.ink, textAlign: "center", margin: "28px 0 36px", textDecoration: "underline" }}>
      {heading}
    </div>
    <div style={{ fontFamily: FONTS.typewriter, fontSize: 40, lineHeight: 1.5, color: "#2b2620" }}>{children}</div>
  </Paper>
);

// Foto cetak dengan bingkai putih dan keterangan tulisan tangan.
// `treatment="archive"` memberi kesan foto lama (hitam-putih kecoklatan).
export const PhotoPrint: React.FC<{
  src: string;
  width: number;
  height: number;
  caption?: string;
  treatment?: "archive" | "none";
}> = ({ src, width, height, caption, treatment = "archive" }) => (
  <div style={{ padding: 22, paddingBottom: caption ? 90 : 22, backgroundColor: COLORS.paper, position: "relative" }}>
    <PaperSurface tone="fresh" />
    <Img
      src={src}
      style={{
        width,
        height,
        objectFit: "cover",
        display: "block",
        position: "relative",
        filter: treatment === "archive" ? "grayscale(1) sepia(0.35) contrast(1.08) brightness(0.95)" : undefined,
      }}
    />
    {caption ? (
      <div style={{ position: "absolute", left: 30, bottom: 18, fontFamily: FONTS.hand, fontSize: 52, color: "#24324a" }}>{caption}</div>
    ) : null}
  </div>
);

// Halaman koran. Badan berita digambar sebagai baris abstrak agar tidak
// mengarang isi artikel; hanya kop, tanggal, dan judul yang terbaca.
export const Newspaper: React.FC<{
  width?: number;
  height?: number;
  masthead: string;
  date: string;
  headline: string;
  deck?: string;
  image?: string;
}> = ({ width = 860, height = 1180, masthead, date, headline, deck, image }) => {
  const columns = 3;
  const line = (i: number) => 70 + ((i * 37) % 30);
  return (
    <Paper width={width} height={height} padding={44} tone="aged">
      <div style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 92, textAlign: "center", color: COLORS.ink, lineHeight: 1 }}>{masthead}</div>
      <div style={{ borderTop: `4px solid ${COLORS.ink}`, borderBottom: `1.5px solid ${COLORS.ink}`, margin: "16px 0 22px", padding: "6px 0", fontFamily: FONTS.mono, fontSize: 22, textAlign: "center", color: COLORS.ink }}>
        {date}
      </div>
      <div style={{ fontFamily: FONTS.serif, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: COLORS.ink }}>{headline}</div>
      {deck ? <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: 30, margin: "16px 0", color: "#3a3428" }}>{deck}</div> : null}
      {image ? (
        <Img src={image} style={{ width: "100%", height: 300, objectFit: "cover", filter: "grayscale(1) contrast(1.2)", margin: "10px 0 18px" }} />
      ) : null}
      <div style={{ display: "flex", gap: 22 }}>
        {Array.from({ length: columns }, (_, c) => (
          <div key={c} style={{ flex: 1 }}>
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i} style={{ height: 9, width: `${line(i + c * 7)}%`, background: "rgba(40,34,26,0.55)", marginBottom: 9 }} />
            ))}
          </div>
        ))}
      </div>
    </Paper>
  );
};
