#!/usr/bin/env bash
#
# Generate PBF glyph ranges from TTF/OTF font files for MapLibre GL.
#
# Usage:
#   ./generate-glyphs.sh                    # process all fonts in input/
#   ./generate-glyphs.sh MyFont-Regular.ttf # process a specific font file
#
# Prerequisites:
#   cargo install build_pbf_glyphs
#
# Place .ttf or .otf files in the input/ directory, then run this script.
# Output goes to output/<FontName>/0-255.pbf, etc.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT_DIR="$SCRIPT_DIR/input"
OUTPUT_DIR="$SCRIPT_DIR/output"

if ! command -v build_pbf_glyphs &>/dev/null; then
    echo "build_pbf_glyphs not found. Install with: cargo install build_pbf_glyphs"
    exit 1
fi

if [ $# -gt 0 ]; then
    # Process specific file(s)
    for font in "$@"; do
        path="$INPUT_DIR/$font"
        if [ ! -f "$path" ]; then
            echo "Font not found: $path"
            exit 1
        fi
        tmpdir=$(mktemp -d)
        cp "$path" "$tmpdir/"
        echo "Processing $font..."
        build_pbf_glyphs "$tmpdir" "$OUTPUT_DIR" --overwrite
        rm -rf "$tmpdir"
    done
else
    # Process all fonts in input/
    if [ -z "$(ls "$INPUT_DIR"/*.ttf "$INPUT_DIR"/*.otf 2>/dev/null)" ]; then
        echo "No .ttf or .otf files found in $INPUT_DIR"
        exit 1
    fi
    echo "Processing all fonts in $INPUT_DIR..."
    build_pbf_glyphs "$INPUT_DIR" "$OUTPUT_DIR" --overwrite
fi

echo "Done. Glyphs written to $OUTPUT_DIR/"
ls "$OUTPUT_DIR"
