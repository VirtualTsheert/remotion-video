import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, MultiPolygon } from "geojson";

// Dunia peta: wilayah Natural Earth yang disiapkan scripts/build-geo.mjs,
// diproyeksikan Mercator ke bidang piksel berukuran tetap. Karena proyeksinya
// tetap, keyframe kamera bisa ditulis langsung dalam derajat: key(f, geo([lon, lat]), zoom).
export const MAP_BBOX = [88, -16, 150, 12] as const;
export const MAP_WIDTH = 3000;

export const projection = geoMercator().fitWidth(MAP_WIDTH, {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: [
      [MAP_BBOX[0], MAP_BBOX[1]],
      [MAP_BBOX[2], MAP_BBOX[3]],
    ],
  },
});

const [, mapBottom] = projection([MAP_BBOX[0], MAP_BBOX[1]]) as [number, number];
export const MAP_HEIGHT = Math.ceil(mapBottom);

export type LonLat = [number, number];
export const geo = (p: LonLat): [number, number] => projection(p) as [number, number];

export type Region = FeatureCollection<MultiPolygon, { iso: string; name: string }>;
export type Place = { name: string; lon: number; lat: number; rank: number };

// Memuat JSON dari public/ sekali per tab render (cache promise tingkat modul),
// dan menahan render sampai data siap.
const cache = new Map<string, Promise<unknown>>();
const load = (file: string) => {
  if (!cache.has(file)) cache.set(file, fetch(staticFile(file)).then((r) => r.json()));
  return cache.get(file) as Promise<unknown>;
};

export const useStaticJson = <T,>(file: string): T | null => {
  const [data, setData] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(`Memuat ${file}`));
  useEffect(() => {
    load(file)
      .then((json) => {
        setData(json as T);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [file, handle]);
  return data;
};
