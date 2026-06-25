# 🍓 Raspidash

A self-hosted dashboard for your Raspberry Pi with connected screen. Monitor Proxmox VE and TrueNAS servers through a beautiful, customizable widget-based interface.

## Features

- **Drag-and-drop grid layout** — resize and reposition widgets freely
- **Proxmox VE** — node CPU/RAM stats, VM/CT list with status
- **TrueNAS** — pool usage, active alerts
- **Clock widget** — fullscreen date/time display
- **Live updates** — WebSocket push + configurable polling interval
- **Kiosk mode** — boots directly to dashboard on Pi startup
- **Dark theme** — designed for always-on displays

## Quick Start (Docker)

```bash
git clone <this-repo> raspidash
cd raspidash
docker compose up -d
```

Open **http://localhost:3000** in your browser.

1. Click the **Settings** (gear) icon → **Add integration**
2. Enter your Proxmox or TrueNAS URL and credentials
3. Click **Edit Layout** → **Add Widget** to build your dashboard

## Pi Kiosk Setup

After Docker Compose is running on your Pi:

```bash
bash pi-kiosk/install.sh
sudo systemctl start raspidash-kiosk
```

On next boot the Pi will automatically open Chromium in full-screen kiosk mode pointing at the dashboard.

## Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:3001`.

## Adding More Widgets

1. Add the component in `frontend/src/components/widgets/`
2. Register it in `frontend/src/components/WidgetRenderer.tsx`
3. Add it to the catalog in `frontend/src/components/AddWidgetModal.tsx`
4. Add the type to `frontend/src/types.ts`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATA_PATH` | `/data/config.json` | Where config is persisted |
| `PORT` | `3001` | Backend port |
| `RASPIDASH_URL` | `http://localhost:3000` | URL for kiosk to open |
