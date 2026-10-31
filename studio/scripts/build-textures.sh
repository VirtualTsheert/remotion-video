#!/usr/bin/env bash
# Membuat tekstur statis sekali saja (cache), agar render tidak menghitung
# noise di setiap frame. Hasil: public/textures/. Aman dijalankan ulang.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/textures
mkdir -p "$OUT"
ff() { ffmpeg -y -hide_banner -loglevel error "$@"; }

# Grain film: 4 frame noise abu-abu sedikit lebih besar dari layar 1080x1920,
# diganti & digeser tiap 2 frame (lihat engine/layers/Finish.tsx).
rm -f "$OUT"/grain-*.png
for i in 0 1 2 3; do
  ff -f lavfi -i "color=c=gray:s=1200x2040,noise=alls=60:allf=u:all_seed=$((i * 7919 + 13)),format=gray" \
    -frames:v 1 -q:v 4 "$OUT/grain-$i.jpg"
done

# Serat kertas: noise halus + bercak lebar, dipakai sebagai multiply di atas warna kertas.
ff -f lavfi -i "color=c=white:s=1024x1024,noise=alls=18:allf=u:all_seed=5,format=gray" \
  -f lavfi -i "color=c=white:s=64x64,noise=alls=40:allf=u:all_seed=9,format=gray,scale=1024:1024:flags=bicubic" \
  -filter_complex "[0][1]blend=all_mode=multiply,eq=contrast=0.6:brightness=0.06" \
  -frames:v 1 -q:v 3 "$OUT/paper.jpg"

echo "Tekstur dibuat di $OUT"
