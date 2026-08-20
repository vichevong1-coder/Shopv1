#!/bin/sh
set -e

echo "========================================"
echo "🚀 ShopV1 Backend — Startup"
echo "========================================"

# ── 1. Apply database schema ─────────────────────────────────────────────────
echo ""
echo "📐 Applying database schema (prisma db push)..."
npx prisma db push --accept-data-loss
echo "✅ Schema up to date"

# ── 2. Seed on first boot ─────────────────────────────────────────────────────
# Detect first boot by checking if /app/uploads is empty.
# The seeder copies mock-images into uploads AND inserts DB records.
UPLOAD_COUNT=$(find /app/uploads -type f 2>/dev/null | wc -l)

if [ "$UPLOAD_COUNT" -eq 0 ]; then
  echo ""
  echo "📦 First boot detected — seeding database and copying product images..."
  node dist/seeders/seedPostgres.js
  echo "✅ Seeding complete"
else
  echo ""
  echo "✅ Uploads directory already populated ($UPLOAD_COUNT files) — skipping seed"
fi

# ── 3. Start the application ──────────────────────────────────────────────────
echo ""
echo "🟢 Starting server..."
exec node dist/server.js
