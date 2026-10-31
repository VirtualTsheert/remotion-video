#!/usr/bin/env bash
# Menyiapkan dependensi sistem untuk render di GitHub Codespaces (Ubuntu 24.04).
# Perlu dijalankan ulang setiap kali Codespace di-rebuild.
set -euo pipefail

sudo apt-get update -qq
# Library yang dibutuhkan Chrome Headless Shell (dipakai Remotion untuk render).
# ffmpeg lengkap: FFmpeg bawaan Remotion tidak punya filter QC (blackdetect, freezedetect, tile).
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  libgbm1 libasound2t64 libatk-bridge2.0-0 libatk1.0-0 libxkbcommon0 libcups2 \
  libdrm2 libxcomposite1 libxdamage1 libxrandr2 libxfixes3 libnss3 libegl1 libgles2 \
  ffmpeg

echo "Dependensi sistem siap. Jalankan 'npm install' di folder studio/ bila belum."
