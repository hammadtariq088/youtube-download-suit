#!/usr/bin/env bash
set -euo pipefail

echo "Deploying worker to Hostinger VPS..."

HOST="${DEPLOY_HOST:-user@your-vps-ip}"
REMOTE_DIR="${REMOTE_DIR:-/opt/yds-worker}"

if [[ "${HOST}" == "user@your-vps-ip" ]]; then
  echo "ERROR: Set DEPLOY_HOST environment variable to your VPS address."
  echo "  export DEPLOY_HOST=root@your-vps-ip"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "Building worker..."
docker build -f docker/Dockerfile.worker -t yds-worker .

echo "Saving image..."
docker save yds-worker | bzip2 | ssh "$HOST" "bunzip2 | docker load"

echo "Stopping old worker..."
ssh "$HOST" "cd $REMOTE_DIR && docker-compose stop worker 2>/dev/null || true"

echo "Starting worker..."
ssh "$HOST" "cd $REMOTE_DIR && docker-compose up -d worker"

echo "Worker deployment complete."
echo ""
echo "For manual deployment without Docker:"
echo "1. SSH into VPS"
echo "2. Install Node.js 22, pnpm, yt-dlp, ffmpeg"
echo "3. Clone repository"
echo "4. Copy .env file"
echo "5. Run: pnpm install && pnpm --filter @yds/worker build"
echo "6. Run: pm2 start worker/ecosystem.config.js"
