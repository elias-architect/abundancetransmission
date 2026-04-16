#!/bin/bash
# merge_content.sh
# ─────────────────
# Merges HiggsField videos with ElevenLabs voiceover audio.
# Output: ready-to-post MP4 files in /output/final/
#
# Usage:
#   ./merge_content.sh              # merge all pairs
#   ./merge_content.sh --dry-run   # preview without merging

set -euo pipefail

VIDEOS_DIR="$(dirname "$0")/../../output/videos"
AUDIO_DIR="$(dirname "$0")/../../output/audio"
FINAL_DIR="$(dirname "$0")/../../output/final"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

mkdir -p "$FINAL_DIR"

echo "── Merge Pipeline ────────────────────────────────"
echo "   Videos: $VIDEOS_DIR"
echo "   Audio:  $AUDIO_DIR"
echo "   Output: $FINAL_DIR"
echo ""

SUCCESS=0
SKIPPED=0
FAILED=0

for video in "$VIDEOS_DIR"/transmission-*.mp4; do
    [[ -f "$video" ]] || continue

    base=$(basename "$video" .mp4)
    audio="$AUDIO_DIR/${base}.mp3"
    output="$FINAL_DIR/${base}-final.mp4"

    if [[ -f "$output" ]]; then
        echo "⏭  Skipping $base (already merged)"
        ((SKIPPED++)) || true
        continue
    fi

    echo "🎬 Merging: $base"

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "   [dry-run] would merge: $video + ${audio:-no audio}"
        ((SUCCESS++)) || true
        continue
    fi

    if [[ -f "$audio" ]]; then
        # Merge video + voiceover audio
        # - Video audio is kept at 15% volume (background atmosphere)
        # - Voiceover is at 100%
        # - Output trimmed to the shorter of video/audio
        ffmpeg -y \
            -i "$video" \
            -i "$audio" \
            -filter_complex "[0:a]volume=0.15[bg];[1:a]volume=1.0[vo];[bg][vo]amix=inputs=2:duration=shortest[out]" \
            -map 0:v \
            -map "[out]" \
            -c:v copy \
            -c:a aac \
            -shortest \
            "$output" \
            -loglevel error

        echo "   ✅ → $output"
        ((SUCCESS++)) || true
    else
        # No audio — just copy video as-is
        echo "   ⚠️  No audio found for $base, copying video only"
        cp "$video" "$output"
        ((SUCCESS++)) || true
    fi
done

echo ""
echo "── Done ──────────────────────────────────────────"
echo "✅ Merged:  $SUCCESS"
echo "⏭  Skipped: $SKIPPED"
echo "❌ Failed:  $FAILED"
echo ""
echo "Final videos ready in: $FINAL_DIR"
