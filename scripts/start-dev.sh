#!/bin/bash
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ─────────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }

section() { echo ""; echo -e "${BOLD}${CYAN}──── $1 ──${NC}"; }

# ── Script directory (resolve symlinks) ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# ── 1. Check Docker ──────────────────────────────────────────────────────────
section "Docker"
info "Checking Docker..."
if ! command -v docker &> /dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi
if ! docker info &> /dev/null; then
  error "Docker is not running. Start Docker and try again."
fi
success "Docker is ready"

# ── 2. Setup .env ────────────────────────────────────────────────────────────
section "Environment"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    success "Created .env from .env.example"
    warn "Please edit .env and fill in your secrets (DISCORD_*, JWT_SECRET, POSTGRES_PASSWORD)"
    warn "Then run this script again."
    exit 0
  else
    error ".env.example not found"
  fi
else
  info ".env already exists, skipping"
fi

# Source .env to get values for healthcheck
set -a
# shellcheck disable=SC1091
source .env
set +a

# ── 3. Start infrastructure (postgres + redis only) ──────────────────────────
section "Infrastructure"
info "Starting postgres and redis..."
docker compose up -d postgres redis
success "Infrastructure containers started"

# ── 4. Wait for services ────────────────────────────────────────────────────
section "Health Checks"
info "Waiting for postgres to be ready..."
for i in $(seq 1 30); do
  if docker exec anime-bot-postgres pg_isready -U "${POSTGRES_USER:-waifu}" -d "${POSTGRES_DB:-waifubot}" &> /dev/null; then
    success "Postgres is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    error "Postgres did not become ready in time (30s timeout)"
  fi
  echo -n "."
  sleep 1
done
echo ""

info "Waiting for redis to be ready..."
for i in $(seq 1 15); do
  if docker exec anime-bot-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    success "Redis is ready"
    break
  fi
  if [ "$i" -eq 15 ]; then
    error "Redis did not become ready in time (15s timeout)"
  fi
  echo -n "."
  sleep 1
done
echo ""

# ── 5. Install dependencies ────────────────────────────────────────────────
section "Dependencies"
info "Installing dependencies..."
if ! command -v pnpm &> /dev/null; then
  error "pnpm is not installed. Run: npm install -g pnpm"
fi
pnpm install --frozen-lockfile
success "Dependencies installed"

# ── 6. Database setup ──────────────────────────────────────────────────────
section "Database Setup"
info "Generating database schema..."
pnpm db:generate

info "Pushing schema to database..."
pnpm db:push

info "Seeding categories..."
pnpm db:seed:categories

info "Seeding works..."
pnpm db:seed:works

info "Seeding characters..."
pnpm db:seed:characters

success "Database setup complete"

# ── 7. Start dev servers ────────────────────────────────────────────────────
section "Development Servers"
info "Starting turbo dev..."
echo ""
echo -e "  ${YELLOW}Tip:${NC} Run ${BOLD}docker compose logs -f${NC} to watch container logs"
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop everything"
echo ""
echo -e "${GREEN}${BOLD}All done! Starting turbo dev...${NC}"
echo ""
exec pnpm dev
