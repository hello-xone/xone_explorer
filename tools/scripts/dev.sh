#!/bin/bash

# download assets for the running instance
dotenv \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/download_assets.sh ./public/assets/configs'

yarn svg:build-sprite
echo ""

# generate envs.js file and run the app

# Ensure we have a sensible GIT TAG even if the repo has no tags
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [ -z "$GIT_TAG" ]; then
  # Best-effort fetch tags; ignore errors
  git fetch --tags --quiet 2>/dev/null || true
  GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
fi
if [ -z "$GIT_TAG" ]; then
  GIT_TAG="$GIT_SHA"
fi

dotenv \
  -v NEXT_PUBLIC_GIT_COMMIT_SHA=$GIT_SHA \
  -v NEXT_PUBLIC_GIT_TAG=$GIT_TAG \
  -e .env.secrets \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/make_envs_script.sh && next dev -H 0.0.0.0 --turbopack -p $NEXT_PUBLIC_APP_PORT' |
 pino-pretty