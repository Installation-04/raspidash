#!/bin/bash
# Raspidash kiosk launcher — runs on Pi boot via systemd
# Waits for the dashboard to be reachable, then opens Chromium in kiosk mode.

DASHBOARD_URL="${RASPIDASH_URL:-http://localhost:7531}"
DISPLAY="${DISPLAY:-:0}"

# Hide cursor
unclutter -idle 0.5 -root &

# Wait for dashboard
echo "Waiting for Raspidash at $DASHBOARD_URL..."
until curl -sf "$DASHBOARD_URL/api/health" > /dev/null 2>&1; do
  sleep 2
done
echo "Dashboard is up, launching Chromium..."

# Launch Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --no-first-run \
  --check-for-update-interval=31536000 \
  --disable-restore-session-state \
  --autoplay-policy=no-user-gesture-required \
  "$DASHBOARD_URL"
