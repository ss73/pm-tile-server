# PM Tile Server — Specification

## Overview

A self-hosted map tile service using Protomaps planet tiles, served by Caddy with the pmtiles plugin, and accompanied by a MapLibre GL web client.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Host Machine                                   │
│                                                 │
│  ./data/          (shared tile storage)         │
│    ├── YYYYMMDD.pmtiles   (actual tile file)    │
│    └── planet.pmtiles -> YYYYMMDD.pmtiles       │
│                                                 │
│  ┌─────────────┐       ┌─────────────────────┐  │
│  │ Downloader  │       │ Caddy + pmtiles     │  │
│  │ (one-shot)  │──────▶│ (docker-compose)    │  │
│  │             │ writes│                     │  │
│  │ docker run  │       │ :80                 │  │
│  └─────────────┘       │  /tiles/* → pmtiles │  │
│                        │  /*      → web app  │  │
│                        └─────────────────────┘  │
│                              │                  │
│                           :8080 (host)          │
└─────────────────────────────────────────────────┘
```

## Components

### 1. Downloader (one-shot container)

**Purpose:** Download the latest Protomaps planet tile into `./data/`.

**How it runs:** Manually from the command line via a shell script that wraps `docker run`. Not part of docker-compose.

**Image:** Alpine-based with curl.

**Behavior:**
- Acquires a lock file (`/data/download.lock`) using `flock`. If another instance is already running, exits immediately. The lock is released automatically when the process exits (including crashes/kills).
- Fetches the build metadata from `https://build-metadata.protomaps.dev/builds.json` to determine the latest available `YYYYMMDD.pmtiles` file.
- Compares against the current symlink target in `./data/` (if any) to determine if a newer build exists.
- If a newer build is available, downloads it in a retry loop:
  - Uses `curl` with resume support (`-C -`). If a `.part` file exists from a previous interrupted run (or retry), the download resumes from where it left off.
  - On curl failure (network error, server abort), waits with exponential backoff (starting at 10s, capped at 5 minutes) and retries.
  - Retries up to 10 times before exiting with an error. Each retry resumes — no data is re-downloaded. The `.part` file is preserved so the next script invocation continues where it left off.
- On completion, renames `YYYYMMDD.pmtiles.part` to `YYYYMMDD.pmtiles`.
- Updates the `planet.pmtiles` symlink to point to the newly downloaded file.
- Removes the previous tile file (if any) after the symlink is updated.
- Exits when done.

**Logging:** Structured status lines to stdout with ISO 8601 timestamps. Logs download start/resume, periodic progress (bytes downloaded, percentage, speed), retries with backoff duration, and completion/symlink updates. Works for interactive CLI use, Kubernetes (`kubectl logs`), and cron.

**Cron compatibility:** Safe to run on a schedule. Concurrent invocations are prevented by the lock file. Interrupted downloads are resumed on the next run. Each invocation makes progress until the download eventually completes.

**Volume mount:** `./data` is bind-mounted into the container.

**Script:** `download.sh` at the repo root invokes the container:
```
./download.sh
```

### 2. Caddy + pmtiles plugin (long-running service)

**Purpose:** Serve map tiles and the web client.

**How it runs:** `docker compose up` (or `docker compose up -d`).

**Image:** Custom Caddy build using `xcaddy` with the `github.com/protomaps/go-pmtiles/caddy` plugin.

> **Note:** The `protomaps/go-pmtiles` Docker image and GitHub release binaries contain only the standalone `pmtiles` CLI tool — not a Caddy build. The Caddy plugin source lives in the same repo but must be compiled into Caddy separately via `xcaddy`.

**Build:** Multi-stage Dockerfile:
1. Builder stage: `caddy:2-builder` + `xcaddy build --with github.com/protomaps/go-pmtiles/caddy`
2. Runtime stage: `caddy:2` with the custom binary copied in.

**Caddyfile configuration:**
- Global: `order pmtiles_proxy before reverse_proxy`
- Listen on `:80`
- `/tiles/*` — handled by `pmtiles_proxy` with a local filesystem bucket pointing to `/data`
- `/*` — file server serving the web app from `/srv/web`

**Volume mounts:**
- `./data:/data:ro` — tile data (read-only)
- `./web:/srv/web:ro` — web client files (read-only)

**Exposed port:** `8080` on the host, mapped to `80` in the container.

### 3. Web Client

**Purpose:** Example map viewer with style switching.

**Location:** `./web/` directory, served as static files by Caddy.

**Technology:**
- MapLibre GL JS (loaded from CDN)
- `@protomaps/basemaps` (loaded from CDN) for Protomaps tile styles

**Features:**
- Full-screen map with pan and zoom
- Style selector to switch between themes: light, dark, white, grayscale, black
- Tiles sourced from `/tiles/` (relative URL, served by the same Caddy instance)

**Files:**
- `web/index.html` — single-page app containing all markup, styles, and JavaScript

## Directory Structure

```
pm-tile-server/
├── SPEC.md
├── docker-compose.yml
├── download.sh              # runs the downloader container
├── data/                    # tile storage (bind mount, gitignored)
│   ├── YYYYMMDD.pmtiles     # dated tile file
│   └── planet.pmtiles       # symlink → latest YYYYMMDD.pmtiles
├── caddy/
│   ├── Dockerfile
│   └── Caddyfile
├── downloader/
│   ├── Dockerfile
│   └── download-tile.sh     # entrypoint script
└── web/
    └── index.html
```

## Data Source

- **URL pattern:** `https://build.protomaps.com/YYYYMMDD.pmtiles`
- **Size:** ~110 GB for the full planet (zoom 0–15)
- **Update frequency:** Daily builds available; the downloader fetches the latest.
