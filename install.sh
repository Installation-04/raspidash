#!/bin/bash
# Raspidash full installer
# Installs Docker, clones the repo, starts the stack, and optionally sets up the Pi kiosk.
# Usage: bash install.sh
#
# One-liner:
#   curl -fsSL https://raw.githubusercontent.com/Installation-04/raspidash/main/install.sh | bash

set -e

REPO_URL="https://github.com/Installation-04/raspidash.git"
INSTALL_DIR="${RASPIDASH_DIR:-$HOME/raspidash}"
FRONTEND_PORT="${RASPIDASH_PORT:-7531}"
BACKEND_PORT="${RASPIDASH_BACKEND_PORT:-7532}"

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}[✔]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[!]${RESET} $*"; }
error()   { echo -e "${RED}[✘]${RESET} $*"; exit 1; }
section() { echo -e "\n${BOLD}=== $* ===${RESET}\n"; }

# ── Intro ──────────────────────────────────────────────────────────────────────
clear
echo -e "${BOLD}"
echo "  ____                 _     _           _     "
echo " |  _ \ __ _ ___ _ __|_| __| | __ _ ___| |__  "
echo " | |_) / _\` / __| '_ \| |/ _\` |/ _\` / __| '_ \ "
echo " |  _ < (_| \__ \ |_) | | (_| | (_| \__ \ | | |"
echo " |_| \_\__,_|___/ .__/|_|\__,_|\__,_|___/_| |_|"
echo "                |_|                             "
echo -e "${RESET}"
echo " Self-hosted homelab dashboard for Raspberry Pi"
echo ""
echo " Install directory : $INSTALL_DIR"
echo " Frontend port     : $FRONTEND_PORT"
echo " Backend port      : $BACKEND_PORT"
echo ""
read -r -p "Continue? [Y/n] " CONFIRM
[[ "$CONFIRM" =~ ^[Nn]$ ]] && echo "Aborted." && exit 0

# ── 1. System packages ─────────────────────────────────────────────────────────
section "System packages"
sudo apt-get update -qq
sudo apt-get install -y curl git ca-certificates gnupg lsb-release
info "Base packages installed."

# ── 2. Docker ──────────────────────────────────────────────────────────────────
section "Docker"
if command -v docker &>/dev/null; then
  info "Docker already installed: $(docker --version)"
else
  warn "Docker not found — installing..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  info "Docker installed. You may need to log out and back in for group changes."
fi

if ! command -v docker compose &>/dev/null && ! docker compose version &>/dev/null 2>&1; then
  warn "Docker Compose plugin not found — installing..."
  sudo apt-get install -y docker-compose-plugin
fi
info "Docker Compose ready."

# ── 3. Clone / update repo ─────────────────────────────────────────────────────
section "Raspidash source"
if [ -d "$INSTALL_DIR/.git" ]; then
  warn "Existing installation found at $INSTALL_DIR — pulling latest..."
  git -C "$INSTALL_DIR" pull origin main
  info "Updated to latest."
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  info "Cloned to $INSTALL_DIR."
fi

# ── 4. Configure ports ─────────────────────────────────────────────────────────
section "Port configuration"
COMPOSE="$INSTALL_DIR/docker-compose.yml"

# Patch frontend port if user overrode it
if [ "$FRONTEND_PORT" != "7531" ]; then
  sed -i "s|\"7531:80\"|\"${FRONTEND_PORT}:80\"|g" "$COMPOSE"
  warn "Frontend port changed to $FRONTEND_PORT."
fi

# Patch backend port if user overrode it
if [ "$BACKEND_PORT" != "7532" ]; then
  sed -i "s|PORT=7532|PORT=${BACKEND_PORT}|g" "$COMPOSE"
  sed -i "s|backend:7532|backend:${BACKEND_PORT}|g" "$INSTALL_DIR/frontend/nginx.conf"
  warn "Backend port changed to $BACKEND_PORT."
fi

info "Ports configured."

# ── 5. Start Docker stack ──────────────────────────────────────────────────────
section "Starting Raspidash"
cd "$INSTALL_DIR"
docker compose up -d --build
info "Docker stack started."

# ── 6. Wait for health check ───────────────────────────────────────────────────
section "Health check"
echo "Waiting for dashboard to be reachable..."
TRIES=0
until curl -sf "http://localhost:${FRONTEND_PORT}/api/health" > /dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ $TRIES -ge 30 ]; then
    warn "Dashboard not responding after 60 s — check 'docker compose logs' for errors."
    break
  fi
  sleep 2
done
if [ $TRIES -lt 30 ]; then
  info "Dashboard is up at http://localhost:${FRONTEND_PORT}"
fi

# ── 7. Pi kiosk (optional) ─────────────────────────────────────────────────────
section "Pi Kiosk (optional)"
read -r -p "Set up the Pi kiosk (auto-launch Chromium on boot)? [y/N] " KIOSK
if [[ "$KIOSK" =~ ^[Yy]$ ]]; then
  sudo apt-get install -y chromium-browser unclutter

  chmod +x "$INSTALL_DIR/pi-kiosk/kiosk.sh"
  chmod +x "$INSTALL_DIR/pi-kiosk/uninstall.sh"

  TMP=$(mktemp)
  sed "s|/home/pi/raspidash|$INSTALL_DIR|g" \
      "$INSTALL_DIR/pi-kiosk/raspidash-kiosk.service" > "$TMP"
  # Patch port in service env var
  sed -i "s|localhost:7531|localhost:${FRONTEND_PORT}|g" "$TMP"
  sudo cp "$TMP" /etc/systemd/system/raspidash-kiosk.service
  rm "$TMP"

  sudo systemctl daemon-reload
  sudo systemctl enable raspidash-kiosk.service
  info "Kiosk service enabled — will auto-start on next boot."

  read -r -p "Start kiosk now? [y/N] " START_NOW
  if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
    sudo systemctl start raspidash-kiosk.service
    info "Kiosk started."
  fi
else
  info "Skipping kiosk setup."
fi

# ── Done ───────────────────────────────────────────────────────────────────────
section "Installation complete"
echo -e " ${GREEN}${BOLD}Raspidash is running!${RESET}"
echo ""
echo "  Dashboard  →  http://$(hostname -I | awk '{print $1}'):${FRONTEND_PORT}"
echo "  Local      →  http://localhost:${FRONTEND_PORT}"
echo ""
echo " Useful commands:"
echo "   docker compose -f $INSTALL_DIR/docker-compose.yml logs -f   # view logs"
echo "   docker compose -f $INSTALL_DIR/docker-compose.yml restart    # restart"
echo "   bash $INSTALL_DIR/pi-kiosk/uninstall.sh                      # uninstall"
echo ""
