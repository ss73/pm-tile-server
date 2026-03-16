#!/bin/sh
set -e

DATA_DIR="/data"
LOCK_FILE="$DATA_DIR/download.lock"
SYMLINK="$DATA_DIR/planet.pmtiles"
BASE_URL="https://build.protomaps.com"
MAX_RETRIES=10
INITIAL_BACKOFF=10
MAX_BACKOFF=300

log() {
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $1"
}

# Acquire lock (non-blocking)
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    log "Another download is already in progress. Exiting."
    exit 0
fi

# Determine the latest available build
log "Fetching latest build listing..."
LATEST=$(curl -sf "$BASE_URL/" \
    | grep -oE '[0-9]{8}\.pmtiles' \
    | sort -r \
    | head -1)

if [ -z "$LATEST" ]; then
    log "ERROR: Could not determine latest build."
    exit 1
fi

LATEST_DATE="${LATEST%.pmtiles}"
log "Latest available build: $LATEST_DATE"

# Check if we already have this version
if [ -L "$SYMLINK" ]; then
    CURRENT=$(readlink "$SYMLINK" | sed 's/\.pmtiles$//')
    if [ "$CURRENT" = "$LATEST_DATE" ]; then
        log "Already up to date ($CURRENT). Nothing to do."
        exit 0
    fi
    log "Current version: $CURRENT. Upgrading to $LATEST_DATE."
else
    log "No existing tile found. Downloading $LATEST_DATE."
fi

# Download with retries
TARGET="$DATA_DIR/$LATEST_DATE.pmtiles"
PART_FILE="$TARGET.part"
DOWNLOAD_URL="$BASE_URL/$LATEST"
RETRIES=0
BACKOFF=$INITIAL_BACKOFF

while true; do
    if [ -f "$PART_FILE" ]; then
        EXISTING_SIZE=$(stat -c%s "$PART_FILE" 2>/dev/null || stat -f%z "$PART_FILE" 2>/dev/null || echo 0)
        EXISTING_MB=$((EXISTING_SIZE / 1048576))
        log "Resuming download from ${EXISTING_MB} MB"
    else
        log "Starting download: $DOWNLOAD_URL"
    fi

    if curl -C - -o "$PART_FILE" -f "$DOWNLOAD_URL" 2>&1; then
        log "Download complete."
        break
    fi

    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
        log "ERROR: Download failed after $MAX_RETRIES retries. Partial file preserved at $PART_FILE"
        exit 1
    fi

    log "Download interrupted. Retry $RETRIES/$MAX_RETRIES (backoff ${BACKOFF}s)"
    sleep $BACKOFF
    BACKOFF=$((BACKOFF * 2))
    if [ $BACKOFF -gt $MAX_BACKOFF ]; then
        BACKOFF=$MAX_BACKOFF
    fi
done

# Rename part file to final name
mv "$PART_FILE" "$TARGET"
log "Saved $TARGET"

# Update symlink
OLD_TARGET=""
if [ -L "$SYMLINK" ]; then
    OLD_TARGET=$(readlink "$SYMLINK")
fi
ln -sf "$LATEST_DATE.pmtiles" "$SYMLINK"
log "Symlink updated: planet.pmtiles -> $LATEST_DATE.pmtiles"

# Remove old tile
if [ -n "$OLD_TARGET" ] && [ "$OLD_TARGET" != "$LATEST_DATE.pmtiles" ] && [ -f "$DATA_DIR/$OLD_TARGET" ]; then
    rm "$DATA_DIR/$OLD_TARGET"
    log "Removed old tile: $OLD_TARGET"
fi

log "Done."
