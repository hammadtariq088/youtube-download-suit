#!/usr/bin/env bash
set -euo pipefail

echo "Seeding admin user..."

# The admin user is auto-created on first login via auth.controller.ts
# To manually seed, run:

cd "$(dirname "$0")/../backend"

cat << 'SQL' | psql "${DATABASE_URL}"
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@example.com',
  '$2a$12$LJ3m4ys3Lk0TSwHCpNqrV.XxJ5QR0xKxJ5QR0xKxJ5QR0xKxJ5QR0x',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
SQL

echo "Admin user seeded. Change password immediately after first login."
echo "Default credentials: admin@example.com / your-password"
