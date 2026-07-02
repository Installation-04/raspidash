# Development Guide

Architecture notes and workflows for working on Raspidash.

## Project Overview

Raspidash is a self-hosted, Docker-based homelab dashboard built for Raspberry Pi with a connected screen. It has 27+ integrations (Proxmox, Pi-hole, TrueNAS, Home Assistant, *arr stack, Plex, Jellyfin, etc.) and a drag-and-drop grid UI.

## Development Commands

This is a monorepo with independent `backend/` and `frontend/` npm projects.

### Backend (Node.js + Express + TypeScript, port 7532)
```bash
cd backend
npm install
npm run dev      # tsx watch on src/index.ts (live reload)
npm run build    # tsc → dist/
npm start        # node dist/index.js
npm test         # node:test suite via tsx
```

### Frontend (React 18 + Vite + Tailwind, port 5173 in dev)
```bash
cd frontend
npm install
npm run dev      # Vite dev server (proxies /api/* and /ws to backend :7532)
npm run build    # tsc + vite build → dist/
npm run preview  # Preview production build
```

### Docker (full stack)
```bash
docker compose up -d           # Start backend + frontend
docker compose up -d --build   # Rebuild images then start
```

## Architecture

### Data Flow
1. Frontend loads config from `GET /api/settings`
2. Frontend opens WebSocket at `/ws` for real-time updates
3. Backend `poller.ts` fetches all integrations on a configurable interval (default 30s) and broadcasts results to all WebSocket clients
4. Frontend receives updates via `useWebSocket` hook and re-renders widgets
5. Config changes (layout, integrations) are saved via `PUT/POST /api/settings/*`

### Config Persistence
All state lives in a single JSON file at `/data/config.json` (Docker volume). `backend/src/store.ts` provides `loadConfig()` and `saveConfig()`. No database. Passwords/API keys are stored in plaintext but are stripped from `GET /api/settings` responses.

### Widget System
- `Dashboard.tsx` — `react-grid-layout` wrapper that manages drag/resize, emits layout changes
- `WidgetRenderer.tsx` — switches on `widget.type` string to select the right component
- `WidgetShell.tsx` — card wrapper (icon, title, status dot, delete button, drag handle)
- `components/displays/` — reusable `GaugeDisplay`, `GraphDisplay`, `StatDisplay` used across multiple widgets
- Widget type strings follow `{integration}-{subtype}`, e.g. `proxmox-summary`, `truenas-pools`

### Backend Structure
- `src/index.ts` — Express app + WS server; imports and mounts all routers
- `src/store.ts` — JSON config read/write
- `src/validation.ts` — shared input validation for settings/restore payloads
- `src/routes/` — one file per integration (`proxmox.ts`, `pihole.ts`, …) plus `settings.ts` for config CRUD
- `src/services/` — fetch helpers and auth logic per integration; `poller.ts` runs background polling

### Theme System
Fourteen themes are defined in `frontend/src/themes.ts`. `applyTheme()` writes CSS variables onto `:root`. Custom colors from config override the theme defaults. Theme is stored in `AppConfig`.

## Adding a New Integration

Follow these steps in order:

1. **Backend route** — `backend/src/routes/{service}.ts`: define Express router with fetch + error handling
2. **Backend service** — `backend/src/services/{service}.ts`: API client / auth logic
3. **Register router** — `backend/src/index.ts`: `import` and `app.use('/api/{service}', router)`
4. **Frontend API method** — `frontend/src/api.ts`: add method(s) under the integration namespace
5. **Types** — `frontend/src/types.ts`: add integration config interface + widget data types
6. **Widget component** — `frontend/src/components/widgets/{Service}Widget.tsx`
7. **Wire up renderer** — `frontend/src/components/WidgetRenderer.tsx`: add `case` for the new type
8. **Widget catalog** — `frontend/src/components/AddWidgetModal.tsx`: add entry so it's discoverable
9. **Service metadata** — `frontend/src/config/servicesMeta.tsx`: icon + brand color for the integration

The `arr.ts` service (Sonarr/Radarr/Lidarr/Bazarr) and `genericApiKey.ts` are reusable helpers — check them before writing new API fetch logic.

## Key Conventions

- **Naming**: widget types are `{integration}-{subtype}` strings; frontend widget components are `{Service}Widget.tsx`; backend service files mirror route filenames
- **TypeScript strict mode** is on in both projects
- **Tailwind** for layout/spacing; CSS variables (`--color-*`) for theme-aware colors — avoid hardcoded color values in components
- The Vite dev proxy (`vite.config.ts`) forwards `/api/*` and `/ws` to the backend, so the frontend always targets relative URLs
- `poller.ts` is the single source of truth for integration data at runtime; individual API endpoints in routes are used for initial loads and settings saves, not for widget data
- Outbound service fetches use 10s timeouts; the poller enforces a 20s per-integration watchdog
