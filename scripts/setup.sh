#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit OLLAMA_BASE_URL and secrets before production use."
fi

cd apps/backend
npm install

