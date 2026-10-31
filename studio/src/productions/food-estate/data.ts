import manifest from "../../../research/food-estate/imagery.json";
import type { LonLat } from "../../engine/graphics/geo";

// Metadata citra diambil langsung dari manifest riset (satu sumber kebenaran
// dengan scripts/fetch-imagery.mjs): bbox & ukuran → proyeksi pin/rute di atas citra.
type Meta = { bbox: [number, number, number, number]; size: [number, number]; time: string };
const byId = Object.fromEntries(manifest.images.map((i) => [i.id, i])) as unknown as Record<string, Meta>;
export const IMG = {
  plg1989: byId["plg-1989"],
  plg1999: byId["plg-1999"],
  spi1999: byId["spi-1999"],
  smoke2015: byId["smoke-2015"],
  tewai: byId["tewai-2022"],
  kapuas2024: byId["kapuas-2024"],
};

// Koordinat terverifikasi (lihat research/food-estate/dossier.md).
export const PLACE = {
  // Natural Earth populated places
  palangkaRaya: [113.91, -2.21] as LonLat,
  merauke: [140.402, -8.493] as LonLat,
  // OpenStreetMap (node desa)
  belantiSiam: [114.1879, -3.1376] as LonLat,
  tewaiBaru: [113.92, -1.4651] as LonLat,
  palingkauAsri: [114.5014, -2.7986] as LonLat,
  palingkauJaya: [114.4868, -2.8098] as LonLat,
  tajepan: [114.5502, -2.8211] as LonLat,
};

// Jejak Saluran Primer Induk pada citra Landsat 1999 (dosir 3.1): hanya ruas
// lurus yang terverifikasi pada citra. (Garis diagonal di timurnya adalah jalur
// bukaan lahan, bukan kanal — sengaja tidak digambar.)
export const SPI: LonLat[] = [
  [114.014, -2.23],
  [114.686, -2.23],
];

// Titik sungai yang dipotong SPI (identitas sungai dari OpenStreetMap).
export const RIVERS: { name: string; at: LonLat }[] = [
  { name: "S. KAHAYAN", at: [114.02, -2.29] },
  { name: "S. KAPUAS", at: [114.405, -2.29] },
  { name: "S. BARITO", at: [114.866, -2.29] },
];

// Luas blok eks-PLG (UGM, Safrudin 2020).
export const BLOCKS = [
  { name: "A", ha: 309_092 },
  { name: "B", ha: 157_645 },
  { name: "C", ha: 436_498 },
  { name: "D", ha: 137_316 },
  { name: "E", ha: 409_477 },
];
export const BLOCKS_TOTAL = 1_462_027;
