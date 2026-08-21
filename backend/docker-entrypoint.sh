#!/bin/sh
set -e

echo "========================================"
echo "🚀 ShopV1 Backend — Startup"
echo "========================================"

# ── 0. Fail fast on missing config ───────────────────────────────────────────
if [ -z "$DATABASE_URL" ]; then
  echo "💥 DATABASE_URL is not set. Cannot start."
  exit 1
fi

# Product image URLs are built from this and written into the database, so a
# wrong value here is baked in permanently — refuse to start rather than seed
# unreachable localhost URLs.
if [ "$NODE_ENV" = "production" ] && [ -z "$PUBLIC_APP_URL" ]; then
  echo "💥 PUBLIC_APP_URL is not set (e.g. https://api.vongshop.com)."
  echo "   Without it every product image URL would be written as http://localhost:5000."
  exit 1
fi

# Print host/port only — never the password — so misconfiguration is visible in logs.
node -e "try{const u=new URL(process.env.DATABASE_URL);console.log('🔌 Database target: '+u.hostname+':'+(u.port||'5432')+u.pathname+u.search)}catch(e){console.log('⚠️  DATABASE_URL is not a valid URL')}"

# ── 1. Apply database schema ─────────────────────────────────────────────────
# Bounded: an unreachable database makes prisma block indefinitely, which
# previously wedged the container with no output at all.
echo ""
echo "📐 Applying database schema (prisma db push)..."
if timeout 120 npx prisma db push --accept-data-loss; then
  echo "✅ Schema up to date"
else
  code=$?
  # GNU timeout reports 124; BusyBox (alpine) reports 143 after SIGTERM.
  if [ "$code" -eq 124 ] || [ "$code" -eq 143 ]; then
    echo "💥 prisma db push TIMED OUT after 120s — the database is unreachable."
    echo "   Packets are being dropped rather than refused. Usual causes:"
    echo "   • security group / firewall not allowing this host on the DB port"
    echo "   • an IPv6-only database host unreachable from this container"
  else
    echo "💥 prisma db push FAILED (exit $code)"
  fi
  exit 1
fi

# ── 2. Seed / restore assets ─────────────────────────────────────────────────
# The seeder is idempotent: it skips products and the admin user that already
# exist, and re-copies any product image missing from uploads/. Running it on
# every boot means a container that starts with an empty uploads directory
# heals itself instead of serving 404s.
echo ""
echo "📦 Seeding database and restoring product images..."
node dist/seeders/seedPostgres.js
echo "✅ Seed/restore complete"

# ── 3. Start the application ──────────────────────────────────────────────────
echo ""
echo "🟢 Starting server..."
exec node dist/server.js
