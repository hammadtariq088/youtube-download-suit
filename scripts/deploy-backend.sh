#!/usr/bin/env bash
set -euo pipefail

echo "Deploying backend to Render..."

cd "$(dirname "$0")/.."

# Render uses Docker or Git integration
# Option 1: Push to Git and connect to Render
echo "Option 1: Push to GitHub/GitLab and connect to Render dashboard."
echo "  - Set build command: docker build -f docker/Dockerfile.backend -t yds-backend ."
echo "  - Set start command: node dist/index.js"
echo "  - Add environment variables from .env.example"

# Option 2: Manual Docker deployment
if [[ "${1:-}" == "--docker" ]]; then
  docker build -f docker/Dockerfile.backend -t yds-backend .
  docker tag yds-backend registry.render.com/your-project/backend:latest
  docker push registry.render.com/your-project/backend:latest
  echo "Docker image pushed to Render registry."
fi

echo "Don't forget to run migrations:"
echo "  DATABASE_URL=... pnpm --filter @yds/backend run migrate"
