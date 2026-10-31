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
  // —— Produksi FoodEstate (research/food-estate/imagery.json, scripts/fetch-imagery.mjs)
  "fe-plg-1989": entry({
    path: "imagery/food-estate/plg-1989.jpg",
    kind: "photo",
    title: "Kawasan eks-PLG, komposit Landsat 1989",
    source: "NASA GIBS — Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual, 1989",
    license: "NASA: tanpa batasan hak cipta",
    credit: "Citra Landsat (WELD) via NASA GIBS",
  }),
  "fe-plg-1999": entry({
    path: "imagery/food-estate/plg-1999.jpg",
    kind: "photo",
    title: "Kawasan eks-PLG, komposit Landsat 1999",
    source: "NASA GIBS — Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual, 1999",
    license: "NASA: tanpa batasan hak cipta",
    credit: "Citra Landsat (WELD) via NASA GIBS",
  }),
  "fe-spi-1999": entry({
    path: "imagery/food-estate/spi-1999.jpg",
    kind: "photo",
    title: "Jalur Saluran Primer Induk, komposit Landsat 1999",
    source: "NASA GIBS — Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual, 1999",
    license: "NASA: tanpa batasan hak cipta",
    credit: "Citra Landsat (WELD) via NASA GIBS",
  }),
  "fe-smoke-2015": entry({
    path: "imagery/food-estate/smoke-2015.jpg",
    kind: "photo",
    title: "Asap kebakaran di atas Kalimantan, 24 Sep 2015",
    source: "NASA GIBS — MODIS_Terra_CorrectedReflectance_TrueColor, 2015-09-24",
    license: "NASA: tanpa batasan hak cipta",
    credit: "Citra MODIS Terra via NASA GIBS",
  }),
  ...Object.fromEntries(
    (["2020", "2021", "2022", "2023"] as const).map((y) => [
      `fe-tewai-${y}`,
      entry({
        path: `imagery/food-estate/tewai-${y}.jpg`,
        kind: "photo",
        title: `Dekat Desa Tewai Baru, ${y}`,
        source: "NASA GIBS — HLS_S30_Nadir_BRDF_Adjusted_Reflectance (lihat imagery.json untuk tanggal)",
        license: "NASA: tanpa batasan hak cipta; berisi data Copernicus Sentinel-2 yang dimodifikasi",
        credit: "Citra HLS (Copernicus Sentinel-2) via NASA GIBS",
      }),
    ]),
  ) as Record<`fe-tewai-${"2020" | "2021" | "2022" | "2023"}`, AssetEntry>,
  "fe-kapuas-2024": entry({
    path: "imagery/food-estate/kapuas-2024.jpg",
    kind: "photo",
    title: "Palingkau–Tajepan, Kapuas, 28 Jul 2024",
    source: "NASA GIBS — HLS_S30_Nadir_BRDF_Adjusted_Reflectance, 2024-07-28",
    license: "NASA: tanpa batasan hak cipta; berisi data Copernicus Sentinel-2 yang dimodifikasi",
    credit: "Citra HLS (Copernicus Sentinel-2) via NASA GIBS",
  }),
  "fe-tewai-change-fill": entry({
    path: "imagery/food-estate/tewai-change-fill.png",
    kind: "document",
    title: "Area bukaan baru 2020→2022 (analisis tim)",
    source: "scripts/analysis/tewai_change.py",
    license: "Milik proyek",
    credit: "Analisis perubahan citra: tim produksi",
  }),
  "fe-tewai-change-outline": entry({
    path: "imagery/food-estate/tewai-change-outline.png",
    kind: "document",
    title: "Garis tepi bukaan baru (analisis tim)",
    source: "scripts/analysis/tewai_change.py",
    license: "Milik proyek",
    credit: "Analisis perubahan citra: tim produksi",
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
