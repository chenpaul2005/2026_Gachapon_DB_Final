#!/usr/bin/env bash
# Download cohesive stock images for machines and toys.
# Machines: Unsplash (Japanese gachapon vending machines)
# Toys: subject-matched free stock photos from Pexels, Unsplash, and Pixy.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UNSPLASH_OPTS="auto=format&fit=crop&w=900&q=90"
PEXELS_OPTS="auto=compress&cs=tinysrgb&w=900"

normalize() {
  local src="$1" out="$2"
  magick "$src" -auto-orient -resize '500x500^' -gravity center -extent 500x500 -strip -quality 86 "$out"
}

dl_unsplash() {
  local id="$1" out="$2"
  local tmp
  tmp="$(mktemp)"
  curl -fsSL "https://images.unsplash.com/${id}?${UNSPLASH_OPTS}" -o "$tmp"
  normalize "$tmp" "$out"
  rm -f "$tmp"
}

dl_pexels() {
  local id="$1" out="$2"
  local tmp
  tmp="$(mktemp)"
  curl -fsSL "https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?${PEXELS_OPTS}" -o "$tmp"
  normalize "$tmp" "$out"
  rm -f "$tmp"
}

dl_url() {
  local url="$1" out="$2"
  local tmp
  tmp="$(mktemp)"
  curl -fsSL "$url" -o "$tmp"
  normalize "$tmp" "$out"
  rm -f "$tmp"
}

MACHINES="${ROOT}/public/images/machines"
TOYS="${ROOT}/public/images/toys"
mkdir -p "$MACHINES" "$TOYS"

# Machines — gachapon capsule vending (cohesive Japan retail look)
dl_unsplash photo-1778778904120-9cd1ec0a717e  "${MACHINES}/classic.jpg"
dl_unsplash photo-1739371986897-3da06bb0aee6  "${MACHINES}/limited.jpg"
dl_unsplash photo-1772160801956-e471dbee631b  "${MACHINES}/premium.jpg"

# Machine 1 — 經典扭蛋
dl_pexels 15634630 "${TOYS}/m1-panda.jpg"       # panda plush toy
dl_pexels 14852081 "${TOYS}/m1-cat.jpg"         # sewed toy cat
dl_pexels 10768164 "${TOYS}/m1-penguin.jpg"     # penguin plush toy
dl_pexels 4887078 "${TOYS}/m1-rabbit.jpg"
dl_url "https://pixy.org/src/470/4702248.jpg" "${TOYS}/m1-dino.jpg"
dl_unsplash photo-1564470939458-1289338e2d85 "${TOYS}/m1-unicorn.jpg"
dl_pexels 6691725 "${TOYS}/m1-lucky-cat.jpg"    # red and gold lucky cat

# Machine 2 — 限定聯名
dl_pexels 860882 "${TOYS}/m2-bear-a.jpg"
dl_pexels 165263 "${TOYS}/m2-bear-b.jpg"
dl_unsplash photo-1764590212225-b05ea6747046 "${TOYS}/m2-cat.jpg"
dl_unsplash photo-1663120788469-17c664ef2a97 "${TOYS}/m2-magical-girl.jpg"
dl_pexels 8294658 "${TOYS}/m2-robot.jpg"
dl_unsplash photo-1611485046634-219b379c8448 "${TOYS}/m2-dragon.jpg"
dl_pexels 6942407 "${TOYS}/m2-collector.jpg"

# Machine 3 — 稀有收藏
dl_url "https://upload.wikimedia.org/wikipedia/commons/a/aa/Capitoline_she-wolf_Musei_Capitolini_MC1181.jpg" "${TOYS}/m3-wolf.jpg"
dl_unsplash photo-1621944276209-ec3dc5136f4d "${TOYS}/m3-starry-cat.jpg"
dl_pexels 4887078 "${TOYS}/m3-white-rabbit.jpg"
dl_unsplash photo-1709159864028-5b18c0930540 "${TOYS}/m3-butterfly.jpg"
dl_unsplash photo-1636089041221-f1ffb95d0004 "${TOYS}/m3-phoenix.jpg"
dl_unsplash photo-1605786329556-585b445b96ff "${TOYS}/m3-dragon.jpg"
dl_pexels 10615829 "${TOYS}/m3-holy-beast.jpg"
dl_unsplash photo-1577110229713-77f2c98a4f8b "${TOYS}/m3-chaos.jpg"

echo "Downloaded $(find "$MACHINES" "$TOYS" -name '*.jpg' | wc -l) images."
