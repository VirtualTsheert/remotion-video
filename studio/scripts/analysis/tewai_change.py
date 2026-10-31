#!/usr/bin/env python3
"""Deteksi bukaan hutan baru di dekat Desa Tewai Baru (dosir fakta 3.3).

Metode (sengaja sederhana agar mudah diperiksa):
  1. Dua citra HLS Sentinel-2 pada bbox yang sama: sebelum (2020-06-29) dan sesudah (2022-05-13).
  2. Piksel "vegetasi" sebelum: hijau dominan (G > R + 8 dan G > B).
     Piksel "tanah terbuka" sesudah: R >= G - 2 dan cukup terang (R+G+B > 330), bukan awan.
  3. Perubahan = vegetasi → tanah terbuka. Ambil komponen terhubung terbesar.
  4. Luas = jumlah piksel × luas piksel (bbox dibagi ukuran gambar; koreksi cos lintang).

Hasil (selaras dengan citra, untuk dioverlay di video):
  public/imagery/food-estate/tewai-change-fill.png     (RGBA, isian)
  public/imagery/food-estate/tewai-change-outline.png  (RGBA, garis tepi)
  public/imagery/food-estate/tewai-change.json         (luas, pusat, metode)

Pemakaian: python3 -I scripts/analysis/tewai_change.py   (dari folder studio/)
Catatan: ini analisis tim, bukan batas resmi lahan food estate.
"""
import json
import math
import subprocess
from pathlib import Path

DIR = Path("public/imagery/food-estate")
MANIFEST = json.loads(Path("research/food-estate/imagery.json").read_text())
META = {i["id"]: i for i in MANIFEST["images"]}
BEFORE, AFTER = "tewai-2020", "tewai-2022"
W, H = META[AFTER]["size"]
west, south, east, north = META[AFTER]["bbox"]


def load(name):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(DIR / f"{name}.jpg"), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout
    assert len(raw) == W * H * 3, name
    return raw


def is_veg(p, i):
    r, g, b = p[i], p[i + 1], p[i + 2]
    return g > r + 8 and g > b and min(r, g, b) <= 150


def is_bare(p, i):
    r, g, b = p[i], p[i + 1], p[i + 2]
    return min(r, g, b) <= 170 and r >= g - 2 and r + g + b > 330


a, b = load(BEFORE), load(AFTER)
mask = bytearray(W * H)
for k in range(W * H):
    if is_veg(a, k * 3) and is_bare(b, k * 3):
        mask[k] = 1

# Komponen terhubung (4-tetangga), ambil yang terbesar.
label = [0] * (W * H)
best = []
for s in range(W * H):
    if not mask[s] or label[s]:
        continue
    comp, stack = [], [s]
    label[s] = 1
    while stack:
        k = stack.pop()
        comp.append(k)
        x, y = k % W, k // W
        for nk, ok in ((k - 1, x > 0), (k + 1, x < W - 1), (k - W, y > 0), (k + W, y < H - 1)):
            if ok and mask[nk] and not label[nk]:
                label[nk] = 1
                stack.append(nk)
    if len(comp) > len(best):
        best = comp

# Tutup lubang kecil (closing 2 px) agar overlay rapi.
sel = bytearray(W * H)
for k in best:
    sel[k] = 1
def dilate(m, r):
    out = bytearray(W * H)
    for k in range(W * H):
        if m[k]:
            x, y = k % W, k // W
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    if 0 <= x + dx < W and 0 <= y + dy < H:
                        out[(y + dy) * W + x + dx] = 1
    return out
def erode(m, r):
    inv = bytearray(1 - v for v in m)
    return bytearray(1 - v for v in dilate(inv, r))
closed = erode(dilate(sel, 2), 2)
outline = bytearray(c & (1 - e) for c, e in zip(closed, erode(closed, 2)))

lat_mid = (north + south) / 2
px_w = (east - west) / W * 111_320 * math.cos(math.radians(lat_mid))
px_h = (north - south) / H * 110_574
area_ha = len(best) * px_w * px_h / 10_000
cx = sum(k % W for k in best) / len(best)
cy = sum(k // W for k in best) / len(best)


def save_rgba(m, color, alpha, name):
    buf = bytearray()
    for v in m:
        buf += bytes((*color, alpha if v else 0))
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-i", "-", str(DIR / name)],
        input=bytes(buf), check=True,
    )


save_rgba(closed, (215, 54, 43), 255, "tewai-change-fill.png")
save_rgba(outline, (255, 255, 255), 255, "tewai-change-outline.png")
result = {
    "area_ha": round(area_ha),
    "center_px": [round(cx), round(cy)],
    "center_lonlat": [round(west + cx / W * (east - west), 4), round(north - cy / H * (north - south), 4)],
    "before": META[BEFORE]["time"],
    "after": META[AFTER]["time"],
    "method": "vegetasi→tanah terbuka, komponen terbesar, HLS Sentinel-2 (NASA GIBS); analisis tim",
}
(DIR / "tewai-change.json").write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
