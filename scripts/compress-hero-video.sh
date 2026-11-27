#!/usr/bin/env bash
#
# Compress a source clip into the low-data hero background assets used by
# frontend/src/components/HeroVideoBackground.tsx.
#
# Usage:
#   scripts/compress-hero-video.sh <input-video> [output-dir]
#
#   output-dir defaults to frontend/public/media (served as /media/* by Next.js).
#   Set FFMPEG=/path/to/ffmpeg to use a binary that is not on PATH.
#   Set VP9_CRF / H264_CRF to override the quality levels (higher = smaller file).
#
# Produces:
#   hero.webm         VP9, <=720p, 24 fps, no audio, CRF 38 (default)
#   hero.mp4          H.264, <=720p, 24 fps, no audio, CRF 28 (default), +faststart
#
# Why VP9 CRF 38: browsers try the WebM first, so it must be the smaller file. On the
# launch footage VP9 CRF 34 came out larger than H.264 CRF 28 (1,177 KB vs 965 KB);
# CRF 38 gave 814 KB with no visible difference. Check both sizes after re-encoding.
#   hero-poster.webp  first frame, <=720p, WebP quality 75 (target < 100 KB)
#
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <input-video> [output-dir]" >&2
  exit 64
fi

input=$1
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
out_dir=${2:-"$repo_root/frontend/public/media"}
ffmpeg_bin=${FFMPEG:-ffmpeg}
vp9_crf=${VP9_CRF:-38}
h264_crf=${H264_CRF:-28}

if [[ ! -f $input ]]; then
  echo "Input file not found: $input" >&2
  exit 66
fi
if ! command -v "$ffmpeg_bin" >/dev/null 2>&1 && [[ ! -x $ffmpeg_bin ]]; then
  echo "FFmpeg not found. Install it, or set FFMPEG=/path/to/ffmpeg." >&2
  exit 69
fi

mkdir -p "$out_dir"

# Never upscale; keep the aspect ratio (even width); cap the frame rate at 24.
video_filter="scale=-2:'min(720,ih)':flags=lanczos,fps=24"
common=(-hide_banner -loglevel error -y -i "$input" -map 0:v:0 -an -map_metadata -1 -vf "$video_filter" -pix_fmt yuv420p)

echo "Encoding hero.webm (VP9)..."
"$ffmpeg_bin" "${common[@]}" \
  -c:v libvpx-vp9 -crf "$vp9_crf" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  "$out_dir/hero.webm"

echo "Encoding hero.mp4 (H.264)..."
"$ffmpeg_bin" "${common[@]}" \
  -c:v libx264 -crf "$h264_crf" -preset slow -profile:v high -movflags +faststart \
  "$out_dir/hero.mp4"

echo "Extracting hero-poster.webp (first frame)..."
"$ffmpeg_bin" -hide_banner -loglevel error -y -i "$input" -map 0:v:0 -frames:v 1 \
  -vf "scale=-2:'min(720,ih)':flags=lanczos" \
  -c:v libwebp -quality 75 -compression_level 6 \
  "$out_dir/hero-poster.webp"

poster_bytes=$(wc -c < "$out_dir/hero-poster.webp")
if (( poster_bytes > 100 * 1024 )); then
  echo "Warning: hero-poster.webp is $((poster_bytes / 1024)) KB (target < 100 KB). Consider a lower -quality." >&2
fi

echo "Done:"
for file in hero.webm hero.mp4 hero-poster.webp; do
  printf '  %-17s %6d KB\n' "$file" $(( $(wc -c < "$out_dir/$file") / 1024 ))
done
