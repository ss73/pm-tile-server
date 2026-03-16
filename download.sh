#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"

mkdir -p "$DATA_DIR"

docker build -t pm-tile-downloader "$SCRIPT_DIR/downloader"

docker run --rm \
    -v "$DATA_DIR:/data" \
    pm-tile-downloader
