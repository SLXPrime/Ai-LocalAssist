#!/usr/bin/env sh
set -eu

docker compose up -d postgres redis open-webui homeassistant
cd apps/backend
npm run start:dev

