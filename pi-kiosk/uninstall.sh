#!/bin/bash
# Raspidash uninstaller
# Removes the kiosk service and optionally the Docker containers and data.
# Usage: bash uninstall.sh

set -e

INSTALL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "=== Raspidash Uninstaller ==="
echo ""

# --- Kiosk service ---
if systemctl is-enabled raspidash-kiosk.service &>/dev/null; then
  echo "Stopping and disabling kiosk service..."
  sudo systemctl stop raspidash-kiosk.service  || true
  sudo systemctl disable raspidash-kiosk.service || true
fi

if [ -f /etc/systemd/system/raspidash-kiosk.service ]; then
  echo "Removing kiosk service file..."
  sudo rm -f /etc/systemd/system/raspidash-kiosk.service
  sudo systemctl daemon-reload
fi

echo "Kiosk service removed."
echo ""

# --- Docker containers ---
read -r -p "Stop and remove Docker containers and images? [y/N] " REMOVE_DOCKER
if [[ "$REMOVE_DOCKER" =~ ^[Yy]$ ]]; then
  echo "Taking down Docker Compose stack..."
  cd "$INSTALL_DIR"
  docker compose down --rmi all || true
  echo "Docker containers and images removed."
else
  echo "Skipping Docker removal."
fi

echo ""

# --- Persistent data (config, API keys) ---
read -r -p "Delete saved config and data (API keys, widgets, layout)? [y/N] " REMOVE_DATA
if [[ "$REMOVE_DATA" =~ ^[Yy]$ ]]; then
  echo "Removing Docker volume raspidash_raspidash-data..."
  docker volume rm raspidash_raspidash-data 2>/dev/null || true
  echo "Data volume removed."
else
  echo "Skipping data removal. Your config is safe."
fi

echo ""

# --- Project files ---
read -r -p "Delete the Raspidash project folder ($INSTALL_DIR)? [y/N] " REMOVE_FILES
if [[ "$REMOVE_FILES" =~ ^[Yy]$ ]]; then
  echo "Deleting $INSTALL_DIR..."
  rm -rf "$INSTALL_DIR"
  echo "Project folder deleted."
else
  echo "Skipping project folder deletion."
fi

echo ""
echo "=== Raspidash has been uninstalled. ==="
echo ""
