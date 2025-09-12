#!/bin/bash

# remove previous assets
rm -rf ./public/assets/configs
rm -rf ./public/assets/multichain
rm -rf ./public/assets/envs.js

# download assets for the running instance
dotenv \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/download_assets.sh ./public/assets/configs'

source ./deploy/scripts/build_sprite.sh
echo ""

#!/bin/bash

# generate envs.js file and run the app
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "")
GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$GIT_SHA" ]; then GIT_SHA="dev"; fi
if [ -z "$GIT_TAG" ]; then GIT_TAG="dev"; fi

dotenv \
  -v NEXT_PUBLIC_GIT_COMMIT_SHA="$GIT_SHA" \
  -v NEXT_PUBLIC_GIT_TAG="$GIT_TAG" \
  -v NEXT_PUBLIC_ICON_SPRITE_HASH="${NEXT_PUBLIC_ICON_SPRITE_HASH}" \
  -e .env.secrets \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/make_envs_script.sh && next dev -p $NEXT_PUBLIC_APP_PORT' |
pino-pretty