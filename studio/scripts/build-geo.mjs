#!/usr/bin/env node
// Menyiapkan data peta sekali saja (cache): unduh Natural Earth (domain publik),
// potong ke wilayah Indonesia & sekitarnya, bulatkan koordinat, simpan JSON kecil.
// Hasil: public/geo/region-10m.json (negara) dan public/geo/places.json (kota).
// Unduhan mentah disimpan di .cache/geo/ (tidak di-commit).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const CACHE = path.resolve(".cache/geo");
const OUT = path.resolve("public/geo");
// Batas wilayah [barat, selatan, timur, utara] dalam derajat.
const BBOX = [88, -16, 150, 12];
const DECIMALS = 3; // ≈ 100 m — cukup tajam untuk close-up satu pulau.

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const download = async (name) => {
  const file = path.join(CACHE, `${name}.geojson`);
  if (!existsSync(file)) {
    console.log(`Mengunduh ${name}…`);
    const res = await fetch(`${BASE}/${name}.geojson`);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(file, "utf8"));
};

const round = (n) => Math.round(n * 10 ** DECIMALS) / 10 ** DECIMALS;
const inBox = ([lon, lat]) => lon >= BBOX[0] && lon <= BBOX[2] && lat >= BBOX[1] && lat <= BBOX[3];

// Simpan poligon (pulau) yang punya setidaknya satu titik di dalam wilayah,
// buang titik berurutan yang identik setelah pembulatan.
const cleanRing = (ring) => {
  const out = [];
  for (const [lon, lat] of ring) {
    const p = [round(lon), round(lat)];
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p);
  }
  return out.length >= 4 ? out : null;
};

const countries = await download("ne_10m_admin_0_countries");
const features = [];
for (const f of countries.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  const kept = polys
    .filter((poly) => poly[0].some(inBox))
    .map((poly) => poly.map(cleanRing).filter(Boolean))
    .filter((poly) => poly.length > 0);
  if (kept.length === 0) continue;
  features.push({
    type: "Feature",
    properties: { iso: f.properties.ADM0_A3, name: f.properties.NAME },
    geometry: { type: "MultiPolygon", coordinates: kept },
  });
}
writeFileSync(path.join(OUT, "region-10m.json"), JSON.stringify({ type: "FeatureCollection", bbox: BBOX, features }));

const places = await download("ne_10m_populated_places_simple");
const cities = places.features
  .filter((f) => inBox(f.geometry.coordinates) && f.properties.adm0_a3 === "IDN")
  .map((f) => ({
    name: f.properties.name,
    lon: round(f.geometry.coordinates[0]),
    lat: round(f.geometry.coordinates[1]),
    rank: f.properties.scalerank,
  }))
  .sort((a, b) => a.rank - b.rank);
writeFileSync(path.join(OUT, "places.json"), JSON.stringify(cities, null, 0));

const kb = (f) => (readFileSync(path.join(OUT, f)).length / 1024).toFixed(0);
console.log(`region-10m.json: ${features.length} negara, ${kb("region-10m.json")} KB`);
console.log(`places.json: ${cities.length} kota Indonesia, ${kb("places.json")} KB`);
console.log("Sumber: Natural Earth (naturalearthdata.com), domain publik.");
