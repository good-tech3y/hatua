#!/usr/bin/env bash
CF="$HOME/cloudflared"
LOG="$HOME/cf-ai.log"

if [ ! -x "$CF" ]; then
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

if [ -z "$GROQ_API_KEY" ]; then
  read -s -p "Paste your Groq API key, then press Enter: " GROQ_API_KEY
  echo
  export GROQ_API_KEY
fi

pkill -f "node server/local.js" 2>/dev/null
rm -f "$LOG"
node server/local.js &
NODE_PID=$!
"$CF" tunnel --protocol http2 --url http://localhost:8788 > "$LOG" 2>&1 &
TUNNEL_PID=$!
trap 'kill $NODE_PID $TUNNEL_PID 2>/dev/null' EXIT

echo "Starting the AI server tunnel..."
URL=""
for i in $(seq 1 30); do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG" | grep -v '^https://api\.' | head -1)
  if [ -n "$URL" ]; then break; fi
  sleep 1
done

if [ -z "$URL" ]; then
  echo "The tunnel did not start. Last lines of the log:"
  tail -n 15 "$LOG"
  wait
  exit 1
fi

echo ""
echo "AI server ready at: $URL"
echo "Put this in your .env as EXPO_PUBLIC_AI_URL=$URL"
echo ""
wait
