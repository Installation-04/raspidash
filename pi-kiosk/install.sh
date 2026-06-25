#!/bin/bash
# Run on your Raspberry Pi to set up the kiosk service.
# Usage: bash install.sh

set -e

INSTALL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_FILE="$INSTALL_DIR/pi-kiosk/raspidash-kiosk.service"

echo "Installing dependencies..."
sudo apt-get update -qq
sudo apt-get install -y chromium-browser unclutter curl

echo "Making kiosk script executable..."
chmod +x "$INSTALL_DIR/pi-kiosk/kiosk.sh"

# Patch service file with actual install dir
TMP=$(mktemp)
sed "s|/home/pi/raspidash|$INSTALL_DIR|g" "$SERVICE_FILE" > "$TMP"
sudo cp "$TMP" /etc/systemd/system/raspidash-kiosk.service
rm "$TMP"

echo "Enabling kiosk service..."
sudo systemctl daemon-reload
sudo systemctl enable raspidash-kiosk.service

echo ""
echo "Done! The kiosk will start automatically on next boot."
echo "To start it now: sudo systemctl start raspidash-kiosk"
echo ""
echo "Make sure Docker Compose is running first:"
echo "  cd $INSTALL_DIR && docker compose up -d"
