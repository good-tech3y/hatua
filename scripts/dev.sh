#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CF="$HOME/cloudflared"
AI_LOG="$HOME/cf-ai.log"
APP_LOG="$HOME/cf.log"
KEY_FILE="$ROOT/server/.env.local"
AI_PID=""
AI_TUNNEL_PID=""
APP_TUNNEL_PID=""

if [[ ! -f "$KEY_FILE" ]]; then
  echo "Missing $KEY_FILE. Add GROQ_API_KEY=your_key to that file."
  exit 1
fi

if [[ ! -x "$CF" ]]; then
  echo "Downloading cloudflared, one time only..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

cleanup() {
  trap - EXIT INT TERM
  for pid in "$AI_PID" "$AI_TUNNEL_PID" "$APP_TUNNEL_PID"; do
    if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(
  set -a
  . "$KEY_FILE"
  set +a
  if [[ -z "${GROQ_API_KEY:-}" ]]; then
    echo "GROQ_API_KEY is missing from $KEY_FILE."
    exit 1
  fi
  exec node "$ROOT/server/local.js"
) &
AI_PID=$!

echo "Starting the AI server..."
AI_STATUS=""
for attempt in {1..20}; do
  if ! kill -0 "$AI_PID" 2>/dev/null; then
    echo "The AI server exited. Stop any other server using port 8788, then retry."
    exit 1
  fi
  AI_STATUS="$(curl --max-time 2 -sS -o /dev/null -w '%{http_code}' -X OPTIONS http://localhost:8788/quests 2>/dev/null || true)"
  if [[ "$AI_STATUS" == "204" ]]; then break; fi
  sleep 0.5
done
if [[ "$AI_STATUS" != "204" ]]; then
  echo "The AI server did not become ready on port 8788."
  exit 1
fi

rm -f "$AI_LOG" "$APP_LOG"
"$CF" tunnel --protocol http2 --url http://localhost:8788 > "$AI_LOG" 2>&1 &
AI_TUNNEL_PID=$!
"$CF" tunnel --protocol http2 --url http://localhost:8081 > "$APP_LOG" 2>&1 &
APP_TUNNEL_PID=$!

wait_for_url() {
  local log="$1"
  local name="$2"
  local pid="$3"
  local url=""
  for attempt in {1..30}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "The $name tunnel exited. Last log lines:" >&2
      tail -n 15 "$log" >&2
      return 1
    fi
    url="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$log" | grep -v '^https://api\.' | head -n 1 || true)"
    if [[ -n "$url" ]]; then
      printf '%s' "$url"
      return 0
    fi
    sleep 1
  done
  echo "The $name tunnel did not start. Last log lines:" >&2
  tail -n 15 "$log" >&2
  return 1
}

echo "Starting the AI and app tunnels..."
AI_URL="$(wait_for_url "$AI_LOG" "AI" "$AI_TUNNEL_PID")"
APP_URL="$(wait_for_url "$APP_LOG" "app" "$APP_TUNNEL_PID")"

AI_STATUS=""
for attempt in {1..20}; do
  AI_STATUS="$(curl --max-time 4 -sS -o /dev/null -w '%{http_code}' -X OPTIONS "$AI_URL/quests" 2>/dev/null || true)"
  if [[ "$AI_STATUS" == "204" ]]; then break; fi
  sleep 1
done
if [[ "$AI_STATUS" != "204" ]]; then
  echo "The AI tunnel did not reach the local server. Check $AI_LOG."
  exit 1
fi

if grep -q '^EXPO_PUBLIC_AI_URL=' "$ROOT/.env"; then
  sed -i "s|^EXPO_PUBLIC_AI_URL=.*|EXPO_PUBLIC_AI_URL=$AI_URL|" "$ROOT/.env"
else
  printf '\nEXPO_PUBLIC_AI_URL=%s\n' "$AI_URL" >> "$ROOT/.env"
fi

echo ""
echo "AI API: $AI_URL"
echo "Open the app in Chrome: $APP_URL"
echo "Press Ctrl+C to stop the app, API, and tunnels."
echo ""
EXPO_PACKAGER_PROXY_URL="$APP_URL" npx expo start --web --port 8081
