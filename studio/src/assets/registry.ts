import { staticFile } from "remotion";

// Asset Library: setiap aset visual dicatat beserta asal-usul dan lisensinya,
// agar materi dokumenter bisa dipertanggungjawabkan. Komponen memanggil
// `asset("id")`, bukan path mentah — aset tanpa catatan sumber tidak bisa dipakai.
export type AssetKind = "photo" | "photo-layer" | "texture" | "geodata" | "document" | "test";

export type AssetEntry = {
  path: string; // relatif terhadap public/
  kind: AssetKind;
  title: string;
  source: string; // URL atau cara pembuatan
  license: string;
  // Keterangan untuk penonton/kredit (mis. "Foto: KITLV, 1947").
  credit?: string;
};

const entry = (e: AssetEntry) => e;

export const ASSETS = {
  "texture-paper": entry({
    path: "textures/paper.jpg",
    kind: "texture",
    title: "Serat kertas",
    source: "Dibuat prosedural: scripts/build-textures.sh",
    license: "Milik proyek",
  }),
  "geo-region": entry({
    path: "geo/region-10m.json",
    kind: "geodata",
    title: "Batas negara Asia Tenggara 1:10m",
    source: "https://www.naturalearthdata.com — via scripts/build-geo.mjs",
    license: "Domain publik (Natural Earth)",
  }),
  "geo-places": entry({
    path: "geo/places.json",
    kind: "geodata",
    title: "Kota-kota Indonesia (koordinat)",
    source: "https://www.naturalearthdata.com — via scripts/build-geo.mjs",
    license: "Domain publik (Natural Earth)",
  }),
  "lab-street-photo": entry({
    path: "lab/street-photo.svg",
    kind: "test",
    title: "Adegan jalan uji (gabungan)",
    source: "Dibuat prosedural: scripts/build-lab-assets.py",
    license: "Milik proyek — HANYA untuk pengujian, bukan materi sejarah",
  }),
} satisfies Record<string, AssetEntry>;

export type AssetId = keyof typeof ASSETS;

export const asset = (id: AssetId) => staticFile(ASSETS[id].path);

// Daftar kredit untuk aset yang dipakai sebuah produksi (untuk deskripsi unggahan).
export const credits = (ids: AssetId[]) =>
  [...new Set(ids.map((id) => ASSETS[id].credit ?? `${ASSETS[id].title} — ${ASSETS[id].license}`))];
