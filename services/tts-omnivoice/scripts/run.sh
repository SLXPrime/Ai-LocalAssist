#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

HOST="${TTS_SERVICE_HOST:-0.0.0.0}"
PORT="${TTS_SERVICE_PORT:-18001}"

.venv/bin/uvicorn app.main:app --host "$HOST" --port "$PORT"

