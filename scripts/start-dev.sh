#!/bin/bash
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Helpers ─────────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }
section() { echo ""; echo -e "${BOLD}${CYAN}──── $1 ──${NC}"; }

# ── Parse args ──────────────────────────────────────────────────────────────
SKIP_SEED=false
if [[ "${1:-}" == "--skip-seed" ]] || [[ "${1:-}" == "-s" ]]; then
  SKIP_SEED=true
fi

# ── Script directory ─────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── 1. Docker ───────────────────────────────────────────────────────────────
section "Docker"
if ! command -v docker &> /dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi
if ! docker info &> /dev/null; then
  error "Docker is not running. Start Docker and try again."
fi
success "Docker is ready"

# ── 2. .env ─────────────────────────────────────────────────────────────────
section "Environment"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    success "Created .env from .env.example"
    warn "Please edit .env and fill in your secrets, then run again."
    exit 0
  else
    error ".env.example not found"
  fi
else
  info ".env already exists, skipping"
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

# ── 3. Infrastructure ────────────────────────────────────────────────────────
section "Infrastructure"

pg_port="${POSTGRES_PORT:-5432}"
redis_port="${REDIS_PORT:-6379}"

info "Checking postgres on localhost:$pg_port..."
if command -v pg_isready &> /dev/null && pg_isready -h localhost -p "$pg_port" -U "${POSTGRES_USER:-waifu}" &> /dev/null; then
  info "Postgres already running on port $pg_port"
elif docker ps --format '{{.Names}}' | grep -q '^anime-bot-postgres$'; then
  info "Docker postgres already running"
else
  info "Starting postgres and redis via docker..."
  docker compose up -d postgres redis 2>/dev/null || true
fi

info "Waiting for postgres..."
for i in $(seq 1 30); do
  if docker exec anime-bot-postgres pg_isready -U "${POSTGRES_USER:-waifu}" -d "${POSTGRES_DB:-waifubot}" &> /dev/null; then
    success "Postgres is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    error "Postgres did not become ready in time (30s)"
  fi
  echo -n "."
  sleep 1
done
echo ""

info "Checking redis on localhost:$redis_port..."
if command -v redis-cli &> /dev/null && redis-cli -p "$redis_port" ping 2>/dev/null | grep -q "PONG"; then
  success "Redis already running on port $redis_port"
else
  warn "Redis not reachable — make sure a redis instance is running"
fi

# ── 4. Dependencies ────────────────────────────────────────────────────────
section "Dependencies"
if ! command -v pnpm &> /dev/null; then
  error "pnpm is not installed. Run: npm install -g pnpm"
fi
pnpm install --frozen-lockfile
success "Dependencies installed"

# ── 5. Database setup ──────────────────────────────────────────────────────
section "Database Setup"
info "Generating database schema..."
pnpm db:generate

info "Pushing schema to database..."
pnpm db:push

if [ "$SKIP_SEED" = true ]; then
  warn "Skipping seeds (--skip-seed)"
else
  info "Seeding categories..."
  pnpm db:seed:categories

  info "Seeding works..."
  pnpm db:seed:works

  info "Seeding characters (this may take a few minutes)..."
  pnpm db:seed:characters

  success "Database setup complete"
fi

# ── 6. Dev servers ─────────────────────────────────────────────────────────
section "Development Servers"
echo -e "  ${YELLOW}Tip:${NC} Run ${BOLD}docker compose logs -f${NC} to watch logs"
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop everything"
echo ""
echo -e "${GREEN}${BOLD}All done! Starting turbo dev...${NC}"
echo ""
exec pnpm dev
