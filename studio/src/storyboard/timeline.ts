import type { Production } from "./types";

// Durasi total: transisi menumpuk dua shot, sehingga mengurangi total.
export const productionDuration = (production: Production) =>
  production.shots.reduce((total, shot, i) => {
    const overlap =
      i > 0 && shot.transitionIn && shot.transitionIn.kind !== "cut"
        ? shot.transitionIn.durationInFrames
        : 0;
    return total + shot.durationInFrames - overlap;
  }, 0);

// Validasi storyboard sebelum dirender agar kesalahan muncul di Studio,
// bukan setelah render panjang selesai.
export const validateProduction = (production: Production) => {
  const ids = new Set<string>();
  production.shots.forEach((shot, i) => {
    if (!/^[a-zA-Z0-9-]+$/.test(shot.id)) {
      throw new Error(`Shot id "${shot.id}" hanya boleh huruf, angka, "-"`);
    }
    if (ids.has(shot.id)) throw new Error(`Shot id ganda: "${shot.id}"`);
    ids.add(shot.id);
    const t = shot.transitionIn;
    if (i > 0 && t && t.kind !== "cut") {
      const prev = production.shots[i - 1];
      if (t.durationInFrames >= Math.min(prev.durationInFrames, shot.durationInFrames)) {
        throw new Error(`Transisi ke "${shot.id}" lebih panjang dari shot yang ditumpuknya`);
      }
    }
  });
};
