#!/usr/bin/env bash
# Codespaces helper: opens a Cloudflare quick tunnel to Metro, then starts Expo.
CF="$HOME/cloudflared"
LOG="$HOME/cf.log"

if [ ! -x "$CF" ]; then
  echo "Downloading cloudflared, one time only..."
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

pkill -f "cloudflared tunnel" 2>/dev/null
rm -f "$LOG"

"$CF" tunnel --protocol http2 --url http://localhost:8081 > "$LOG" 2>&1 &
TUNNEL_PID=$!
trap 'kill $TUNNEL_PID 2>/dev/null' EXIT

echo "Starting the tunnel..."
URL=""
for i in $(seq 1 30); do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" | grep -v '^https://api\.' | head -1)
  if [ -n "$URL" ]; then break; fi
  sleep 1
done

if [ -z "$URL" ]; then
  echo "The tunnel did not start. Last lines of the log:"
  tail -n 15 "$LOG"
  exit 1
fi

echo ""
echo "Tunnel ready: $URL"
echo "Open that address in a Chrome tab for the web preview."
echo ""
export EXPO_PACKAGER_PROXY_URL="$URL"
npx expo start --port 8081
