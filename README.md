# PM Tile Server

Self-hosted map tile service using [Protomaps](https://protomaps.com) planet tiles, served by [Caddy](https://caddyserver.com) with the [pmtiles plugin](https://github.com/protomaps/go-pmtiles), and an example [MapLibre GL](https://maplibre.org) web client.

## Prerequisites

- Docker and Docker Compose

## Usage

### 1. Download the planet tile

```sh
./download.sh
```

This builds and runs a container that downloads the latest planet tile (~110 GB) into `./data/`. Downloads resume automatically if interrupted and retry up to 10 times with exponential backoff. Safe to run on a cron schedule — concurrent invocations are prevented by a lock file.

### 2. Start the tile server

```sh
docker compose up
```

Opens on [http://localhost:8080](http://localhost:8080).

### 3. View the map

Open [http://localhost:8080](http://localhost:8080) in a browser. Use the controls in the top-right to switch themes (light, dark, white, grayscale, black, or the custom Blueberry palette), toggle POIs / 3D buildings / road shields, and pick an [API key](#api-key-authentication) to demonstrate the access-control gate.

### Custom themes

The example app includes two custom map themes:

- **Blueberry** — a dark navy theme with a subdued label hierarchy
- **Blueberry Milk** — a matching light theme with dark labels on a pale blue background

![Blueberry dark theme](docs/blueberry.png)
![Blueberry Milk light theme](docs/blueberry-light.png)

Both use the [Inter](https://rsms.me/inter/) font, served locally as PBF glyphs.

### Custom font glyphs

Map labels require fonts in PBF (SDF glyph) format. A generation script is included at `fonts/generate-glyphs.sh`.

**Prerequisites:**

```sh
cargo install build_pbf_glyphs
```

**To add a new font:**

1. Place `.ttf` or `.otf` files in `fonts/input/`
2. Run the script:

```sh
./fonts/generate-glyphs.sh
```

This generates PBF glyph ranges in `fonts/output/<FontName>/` which Caddy serves at `/fonts/{fontstack}/{range}.pbf`.

To process a single font file:

```sh
./fonts/generate-glyphs.sh MyFont-Regular.ttf
```

### API key authentication

Tile requests are gated by an `?key=<value>` query parameter. Caddy matches the value against an inline allowlist and denylist defined in `caddy/Caddyfile`:

| Request | Status |
|---|---|
| no `key` parameter | `401 Unauthorized` |
| `key` matches the denylist | `403 Forbidden` |
| `key` matches the allowlist | `200` (tile served) |
| `key` is anything else | `403 Forbidden` |

To rotate or revoke a key, edit the matchers and run `docker compose up -d --build caddy`. The rebuild is fast and the recreate causes a brief blip; for true zero-downtime updates, bind-mount the Caddyfile and trigger `caddy reload` inside the container instead.

The web viewer at `/` includes a dropdown for cycling through demo / consumer / revoked / unknown / no-key states — handy for verifying gate behaviour in DevTools.

These keys are not secrets. The public viewer ships with a working key visible in DevTools. What the system buys you is **attribution** (one key per consumer), **revocation** (kill leaked keys without redeploying), and the foundation for **rate limiting** (per-key budgets, not yet implemented). For higher assurance, short-lived signed URLs minted by an auth service would be the next step — out of scope here.

#### Why query parameter, not an HTTP header?

A `GET` with only standard headers is a CORS "simple request" — the browser sends it directly to any origin without a preflight. A custom header (e.g. `X-API-Key`) is "non-simple" and the browser sends an `OPTIONS` preflight first. The preflight cache is keyed by the exact URL, so when every tile is a unique URL the cache doesn't help — you end up with roughly twice the request count for cross-origin consumers.

Query parameters also let external consumers plug a tile URL or TileJSON URL straight into MapLibre / OpenLayers / etc. without writing a `transformRequest` callback, and keep the Caddyfile small (no `OPTIONS` handler, no `Access-Control-Allow-Headers`).

The cost is **CDN cache fragmentation**: most CDNs include the full URL (query string and all) in the cache key, so each consumer's request for the same tile becomes a different cache entry. Large public providers use header-based auth partly to avoid this. Mitigations exist (CDNs can be configured to exclude specific query parameters from the cache key); for a self-hosted setup with no CDN, it's a non-issue today.

**To switch to a header instead would require:**

1. Replace the `query key=…` matchers with `header_regexp X-API-Key …` in `caddy/Caddyfile`.
2. Add a CORS preflight handler inside `handle_path /tiles/*` that responds to `OPTIONS` with `Access-Control-Allow-Headers: X-API-Key` (plus an `Access-Control-Allow-Origin` allowlist), and echo `Access-Control-Allow-Origin` on every real tile response.
3. In the viewer, drop the URL templating and add a MapLibre `transformRequest` callback that injects the header on `/tiles/*` requests.

## Architecture

```
./download.sh                    docker compose up
     │                                │
     ▼                                ▼
┌──────────┐    ./data/       ┌─────────────────────┐
│Downloader│───────────────▶  │ Caddy + pmtiles     │
│(one-shot)│  planet.pmtiles  │                     │
└──────────┘  (symlink)       │  :80 -> :8080       │
                              │  /tiles/*  tiles    │
                              │  /*        web app  │
                              └─────────────────────┘
```

## Project Structure

```
├── docker-compose.yml        # Caddy service
├── download.sh               # Runs the downloader container
├── caddy/
│   ├── Dockerfile            # Caddy + pmtiles plugin (xcaddy)
│   └── Caddyfile
├── downloader/
│   ├── Dockerfile            # Alpine + curl + flock
│   └── download-tile.sh
├── web/
│   └── index.html            # MapLibre GL map viewer
├── fonts/
│   ├── generate-glyphs.sh    # Font to PBF glyph converter
│   ├── input/                # Source .ttf/.otf files (gitignored)
│   └── output/               # Generated PBF glyphs, served by Caddy
└── data/                     # Tile storage (gitignored)
```

## License

MIT
