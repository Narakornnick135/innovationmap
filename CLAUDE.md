# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Innovation Map for Northern Thailand — a Next.js web app showing social innovations on a 3D MapLibre GL JS map. Built for adiCET (Chiang Mai Rajabhat University). UI is primarily in Thai.

## Commands

```bash
npm run dev          # Start dev server (default port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

Production deployment (on server at adicet.cmru.ac.th):
```bash
cd /home/cmru/opt/sid/innovationmap
git pull && npm run build && pm2 restart nextapp
```

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MapLibre GL JS

**`basePath: '/innovationmap'`** — deployed at `adicet.cmru.ac.th/innovationmap` via nginx reverse proxy to port 3003. All programmatic `fetch()` calls must be prefixed with `/innovationmap` (basePath does NOT apply to fetch).

### Key Directories

- `src/app/` — App Router pages (main map, embed, share, login, API routes)
- `src/components/` — MapView, Sidebar, InnovationPanel, AddInnovationModal
- `src/lib/` — `data.ts` (JSON file CRUD), `auth.ts` (JWT auth with jose + bcryptjs)
- `src/types/index.ts` — Innovation interface, CATEGORIES, PROVINCES constants
- `src/data/` — `innovations.json` (data store), `users.json` (credentials)
- `public/` — `thailand-provinces.json` (GeoJSON for province boundaries)

### Data Flow

- Data is stored in JSON files (`src/data/innovations.json`), not a database
- API routes (`src/app/api/`) read/write JSON files via `src/lib/data.ts`
- Auth uses JWT (jose library) stored in httpOnly cookies, passwords hashed with bcryptjs

### Map Architecture

- **MapView** uses MapLibre GL JS (free Mapbox alternative, no API key needed)
- **Tiles:** CartoDB Voyager No Labels raster tiles (no road/place labels since we show our own province labels)
- **Province highlighting:** White mask polygon at 65% opacity with holes punched for 9 active northern provinces; indigo border lines
- **Thai text:** Province labels use HTML markers (not MapLibre symbol layers) because MapLibre's glyph PBF system cannot render Thai combining characters correctly
- **Pin click:** Opens right-side InnovationPanel (50vw sliding panel), NOT a map popup
- **`onSelectRef` pattern:** Used to avoid React re-render loops — stores callback in ref to prevent map effect re-firing

### Pages

- `/` — Main map with sidebar + innovation panel
- `/embed` — Embeddable version (no share/login buttons). Supports `?cat=` and `?bar=0` query params. Uses `<Suspense>` boundary for `useSearchParams()`.
- `/share` — iframe code generator
- `/login` — Admin login (credentials: admin / admin1234)
- `/innovation/[id]` — Individual innovation page

## Known Issues

- Next.js 16 has a prerender bug with `_global-error` that may cause build failures. `global-error.tsx` and `not-found.tsx` are workarounds.
- MapView is loaded with `dynamic(() => import(...), { ssr: false })` because MapLibre requires browser APIs.

## Nginx Config

The file `adicet.cmru.ac.th` in the project root is the nginx site config for the production server. Uses a single `location ^~ /innovationmap` block — do NOT add a separate trailing-slash redirect (causes infinite redirect loop with Next.js `trailingSlash: false`).
