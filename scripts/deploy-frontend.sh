#!/usr/bin/env bash
set -euo pipefail

echo "Deploying frontend to Vercel..."

cd "$(dirname "$0")/../frontend"

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Deploy to Vercel
# Requires: vercel CLI or GitHub integration
if command -v vercel &> /dev/null; then
  vercel --prod --yes
else
  echo "Vercel CLI not found. Install with: pnpm add -g vercel"
  echo "Or push to GitHub and connect your repository in Vercel dashboard."
fi

echo "Frontend deployment complete."
