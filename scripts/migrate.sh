#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations..."

cd "$(dirname "$0")/../backend"

# Generate migration files from schema
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

echo "Migrations complete."
