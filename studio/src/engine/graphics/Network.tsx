import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { useCamera } from "../camera/Camera2D";
import { progress } from "../animation/motion";
import { COLORS, EASE } from "../../theme/tokens";
import { FONTS } from "../../theme/fonts";

export type Actor = {
  id: string;
  name: string;
  role?: string;
  x: number;
  y: number;
  at: number;
  photo?: string;
  // Tokoh yang sedang dibahas diberi cincin aksen.
  focus?: boolean;
};

export type Link = {
  from: string;
  to: string;
  at: number;
  label?: string;
  // Posisi label di sepanjang garis (0 = asal, 1 = tujuan). Geser bila bertabrakan.
  labelAt?: number;
  // "confirmed" = hubungan terdokumentasi (garis utuh),
  // "alleged" = dugaan/belum terverifikasi (garis putus-putus).
  kind?: "confirmed" | "alleged";
};

const R = 110;

// Peta hubungan antaraktor dalam koordinat dunia. Gaya garis membedakan
// hubungan yang terdokumentasi dan yang masih dugaan — penting untuk akurasi.
export const Network: React.FC<{ actors: Actor[]; links: Link[] }> = ({ actors, links }) => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const byId = Object.fromEntries(actors.map((a) => [a.id, a]));
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        {links.map((l, i) => {
          const a = byId[l.from];
          const b = byId[l.to];
          const p = progress(frame, l.at, 18, EASE.inOut);
          if (p <= 0) return null;
          // Garis berhenti di tepi lingkaran, bukan di pusat.
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const ux = (b.x - a.x) / len;
          const uy = (b.y - a.y) / len;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = x1 + (b.x - ux * R - x1) * p;
          const y2 = y1 + (b.y - uy * R - y1) * p;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={l.kind === "alleged" ? COLORS.fog : COLORS.accent}
              strokeWidth={6}
              strokeDasharray={l.kind === "alleged" ? "18 14" : undefined}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {links.map((l, i) => {
        if (!l.label) return null;
        const a = byId[l.from];
        const b = byId[l.to];
        const p = progress(frame, l.at + 12, 14);
        const t = l.labelAt ?? 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: a.x + (b.x - a.x) * t,
              top: a.y + (b.y - a.y) * t,
              translate: "-50% -50%",
              // Ukuran konstan di layar, berapa pun zoom kamera.
              scale: 1 / cam.zoom,
              opacity: p,
              padding: "8px 18px",
              background: COLORS.ink,
              border: `2px solid ${l.kind === "alleged" ? COLORS.fog : COLORS.accent}`,
              fontFamily: FONTS.mono,
              fontSize: 32,
              color: COLORS.white,
              whiteSpace: "nowrap",
            }}
          >
            {l.label}
            {l.kind === "alleged" ? " (dugaan)" : ""}
          </div>
        );
      })}
      {actors.map((a) => {
        const p = progress(frame, a.at, 16);
        if (p <= 0) return null;
        const initials = a.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
        return (
          <div key={a.id} style={{ position: "absolute", left: a.x, top: a.y, width: 0, height: 0, opacity: p, scale: 0.85 + p * 0.15 }}>
            <div
              style={{
                position: "absolute",
                left: -R,
                top: -R,
                width: R * 2,
                height: R * 2,
                borderRadius: "50%",
                overflow: "hidden",
                background: COLORS.steel,
                border: `6px solid ${a.focus ? COLORS.accent : COLORS.paperDark}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONTS.serif,
                fontWeight: 900,
                fontSize: 80,
                color: COLORS.paper,
              }}
            >
              {a.photo ? <Img src={a.photo} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1)" }} /> : initials}
            </div>
            <div style={{ position: "absolute", top: R + 18, left: 0, translate: "-50% 0", textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: FONTS.sans, fontWeight: 800, fontSize: 58, color: COLORS.white }}>{a.name}</div>
              {a.role ? <div style={{ fontFamily: FONTS.sans, fontSize: 42, color: COLORS.fog, marginTop: 4 }}>{a.role}</div> : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

// Angka yang berhitung naik, format Indonesia (titik ribuan).
export const Counter: React.FC<{
  from?: number;
  to: number;
  start: number;
  duration?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ from = 0, to, start, duration = 40, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const v = from + (to - from) * progress(frame, start, duration, EASE.inOut);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {Math.round(v).toLocaleString("id-ID")}
      {suffix}
    </span>
  );
};
