# 🍓 Raspidash

A self-hosted, Docker-based homelab dashboard built for Raspberry Pi with a connected screen. Monitor all your servers, services, and network devices from a single always-on display.

![Raspidash](https://img.shields.io/badge/Raspidash-self--hosted-E9455F?style=flat-square&logo=raspberry-pi)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

- **Drag-and-drop grid layout** — freely resize and reposition widgets
- **27 integrations** — from Proxmox and TrueNAS to Sonarr, Plex, SNMP devices and more
- **Host system widgets** — CPU, RAM, disk, temperature, uptime and network interfaces of the Raspidash host
- **Live WebSocket updates** — push + configurable polling interval
- **11 themes** — Dark, Synthwave, Midnight, Dracula, Catppuccin, Nord, Tokyo Night, Gruvbox, AMOLED, Solarized, Light
- **Pi Display Presets** — one-click optimize for 7", 10", HyperPixel, rack screens, and more
- **Background images** — paste any image URL as a wallpaper with adjustable overlay
- **Glassmorphism cards** — tunable blur, opacity, radius, gap
- **Backup & Restore** — download/upload your full config as JSON
- **Kiosk mode** — boots straight to dashboard on Pi startup

---

## Integrations

| Category | Services |
|---|---|
| **Virtualization** | Proxmox VE |
| **Storage** | TrueNAS, Synology DSM |
| **DNS / Network** | Pi-hole, AdGuard Home, UniFi, SNMP Devices |
| **Containers** | Portainer |
| **Home Automation** | Home Assistant |
| **Media** | Plex, Jellyfin |
| **Media Management** | Sonarr, Radarr, Lidarr, Bazarr, Overseerr |
| **Download Clients** | qBittorrent, SABnzbd |
| **Indexers** | Prowlarr |
| **Monitoring** | Uptime Kuma, Speedtest Tracker, Grafana |
| **Photos** | Immich |
| **Dev / Git** | Gitea |
| **Reverse Proxy** | Nginx Proxy Manager |
| **Cloud** | Nextcloud |
| **System** | Cockpit |
| **Host** | System Stats (CPU/RAM/disk/temp), System Network (interfaces & IPs) |

---

## Quick Start

### One-line install (recommended for Raspberry Pi)

```bash
curl -fsSL https://raw.githubusercontent.com/Installation-04/raspidash/main/install.sh | bash
```

The script will:
- Install Docker if not present
- Clone the repo
- Build and start the Docker stack
- Optionally set up the Pi kiosk (auto-launch Chromium on boot)

### Manual install

```bash
git clone https://github.com/Installation-04/raspidash.git
cd raspidash
docker compose up -d
```

Open **http://localhost:7531** in your browser.

1. Click the **⚙ Settings** icon → **Integrations** → **Add integration**
2. Pick your service type — the form adapts to show only the fields that service needs
3. Click **Edit Layout** → **Add Widget** to place widgets on the dashboard
4. Drag to rearrange, resize handles are on the bottom-right of each card

---

## Pi Kiosk Setup

After Docker Compose is running on your Pi:

```bash
bash pi-kiosk/install.sh
sudo systemctl start raspidash-kiosk
```

On next boot the Pi opens Chromium in full-screen kiosk mode pointed at the dashboard.  
Use the **General → Pi Display Presets** in Settings to optimize the layout for your screen size.

### Supported Pi Screens

| Preset | Resolution | Notes |
|---|---|---|
| Raspberry Pi 7" Official | 800×480 | Touch-enabled |
| GeeekPi 10" Rackmount | 1280×800 | 1U rack display |
| Waveshare 7" HDMI | 1024×600 | |
| Waveshare 10.1" HDMI | 1280×800 | |
| HyperPixel 4.0 | 800×480 | Compact |
| HyperPixel 4.0 Square | 720×720 | |
| GeeekPi 7" DSI | 1024×600 | DSI ribbon |
| Standard 1080p | 1920×1080 | Desktop monitor |
| 4K Display | 3840×2160 | |

---

## Authentication

Each integration shows only the fields it actually needs:

| Auth type | Services |
|---|---|
| **API Key only** | Home Assistant, Sonarr, Radarr, Lidarr, Prowlarr, Plex, Grafana, Overseerr, SABnzbd, Immich, Bazarr |
| **Username + Password** | AdGuard Home, Uptime Kuma, Nextcloud, UniFi, Nginx PM, qBittorrent, Synology DSM, Cockpit |
| **API Key or Username/Password** | Proxmox VE, TrueNAS, Portainer, Jellyfin, Speedtest Tracker, Gitea |
| **SNMP** | Any SNMP device — v1/v2c (community string) or v3 (full auth + privacy) |

---

## SNMP Support

Add any SNMP-enabled device (router, switch, UPS, NAS, printer…) as an integration:

- **v1 / v2c** — community string
- **v3** — security name + security level (noAuthNoPriv / authNoPriv / authPriv), auth protocol (MD5 / SHA / SHA-256 / SHA-512), privacy protocol (DES / AES-128 / AES-256)

The widget reads standard MIB-II OIDs: system description, name, location, uptime, interface count, plus HOST-RESOURCES-MIB for CPU load and memory when supported.

---

## Backup & Restore

Under **Settings → General → Backup & Restore**:

- **Download Backup** — exports the full `config.json` as a timestamped JSON file, including all integrations, widgets, layout, credentials, and display settings
- **Restore Backup** — upload a previously downloaded backup to fully restore the dashboard (page reloads automatically)

> ⚠️ The backup includes API keys and passwords in plain text. Store it securely.

---

## Themes

| Theme | Description |
|---|---|
| Dark | Deep navy — default |
| Synthwave | Retro 80s neon: magenta, cyan, electric purple |
| Midnight | Near-black with violet accent |
| AMOLED | Pure black for OLED screens |
| Dracula | Classic purple/pink |
| Catppuccin | Soft lavender Mocha |
| Nord | Arctic blue-grey |
| Tokyo Night | Blue-tinted dark |
| Gruvbox | Warm brown retro |
| Solarized | Teal dark |
| Light | Clean white |

---

## Development

```bash
# Backend (Node.js + Express + TypeScript)
cd backend && npm install && npm run dev   # runs on :7532

# Frontend (React + Vite + Tailwind)
cd frontend && npm install && npm run dev  # runs on :5173
```

The frontend dev server proxies `/api/*` to `localhost:7532`.

### Project Structure

```
raspidash/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express app + WebSocket server
│   │   ├── store.ts          # JSON config persistence
│   │   ├── routes/           # One file per integration + settings
│   │   └── services/         # Fetch helpers per service
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Root layout + navbar + background
│   │   ├── components/
│   │   │   ├── Dashboard.tsx        # Grid layout engine
│   │   │   ├── WidgetShell.tsx      # Card wrapper (icon, status, ping)
│   │   │   ├── WidgetRenderer.tsx   # Routes widget type → component
│   │   │   ├── ServiceStatRow.tsx   # Bottom stat bar on cards
│   │   │   ├── SettingsPanel.tsx    # Slide-in settings panel
│   │   │   ├── AddWidgetModal.tsx   # Widget catalog
│   │   │   └── widgets/             # One file per widget
│   │   ├── config/
│   │   │   └── servicesMeta.tsx     # Icon + brand color per integration
│   │   ├── themes.ts         # Theme definitions + applyTheme()
│   │   └── types.ts          # Shared TypeScript types
│   └── Dockerfile
├── pi-kiosk/
│   ├── install.sh            # Sets up systemd kiosk service
│   ├── kiosk.sh              # Chromium kiosk launcher script
│   └── raspidash-kiosk.service
├── data/                     # Created at runtime — holds config.json
└── docker-compose.yml
```

### Adding a New Integration

1. Add the type string to `Integration['type']` in `frontend/src/types.ts` and `backend/src/store.ts`
2. Add the widget type to `WidgetType` in `frontend/src/types.ts`
3. Add an entry to `INT_CONFIG` in `frontend/src/components/SettingsPanel.tsx` (auth mode, labels, placeholders)
4. Add an entry to `SERVICES_META` in `frontend/src/config/servicesMeta.tsx` (icon + color)
5. Create `backend/src/routes/<service>.ts` + `backend/src/services/<service>.ts`
6. Register the router in `backend/src/index.ts`
7. Add the API call to `frontend/src/api.ts`
8. Create `frontend/src/components/widgets/<Service>Widget.tsx`
9. Add the widget to `WidgetRenderer.tsx` and `AddWidgetModal.tsx`

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATA_PATH` | `/data/config.json` | Where config is persisted inside the container |
| `PORT` | `7532` | Backend API port |
| `RASPIDASH_URL` | `http://localhost:7531` | URL the Pi kiosk opens |

---

## Docker Compose Reference

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    restart: unless-stopped
    volumes:
      - raspidash-data:/data   # config.json lives here
    environment:
      - DATA_PATH=/data/config.json
      - PORT=7532

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "7531:80"              # change 7531 to any port you like
    depends_on:
      - backend

volumes:
  raspidash-data:
```

To change the external port: edit `"3000:80"` → `"8080:80"` etc.

---

## License

MIT — do whatever you want with it.
