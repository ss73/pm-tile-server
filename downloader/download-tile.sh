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
BUILDS_API="https://build-metadata.protomaps.dev/builds.json"
log "Fetching latest build info..."
BUILD_META=$(curl -sf "$BUILDS_API")

LATEST=$(echo "$BUILD_META" \
    | grep -oE '"key":"[0-9]{8}\.pmtiles"' \
    | tail -1 \
    | grep -oE '[0-9]{8}\.pmtiles')

if [ -z "$LATEST" ]; then
    log "ERROR: Could not determine latest build."
    exit 1
fi

TOTAL_BYTES=$(echo "$BUILD_META" \
    | grep -oE "\"key\":\"$LATEST\",\"size\":[0-9]+" \
    | grep -oE '[0-9]+$')
TOTAL_BYTES=${TOTAL_BYTES:-0}

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

    # Run curl in background, monitor progress from file size
    curl -C - -o "$PART_FILE" -f -s "$DOWNLOAD_URL" &
    CURL_PID=$!

    while kill -0 $CURL_PID 2>/dev/null; do
        sleep 30
        if [ -f "$PART_FILE" ]; then
            CUR_SIZE=$(stat -c%s "$PART_FILE" 2>/dev/null || stat -f%z "$PART_FILE" 2>/dev/null || echo 0)
            CUR_GB=$(echo "$CUR_SIZE" | awk '{printf "%.1f", $1/1073741824}')
            if [ "$TOTAL_BYTES" -gt 0 ] 2>/dev/null; then
                TOTAL_GB=$(echo "$TOTAL_BYTES" | awk '{printf "%.1f", $1/1073741824}')
                PCT=$(echo "$CUR_SIZE $TOTAL_BYTES" | awk '{printf "%.1f", $1/$2*100}')
                log "Progress: ${CUR_GB} GB / ${TOTAL_GB} GB (${PCT}%)"
            else
                log "Progress: ${CUR_GB} GB"
            fi
        fi
    done

    wait $CURL_PID && { log "Download complete."; break; }

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
