# Dev Start Script — Design

**Goal:** Create a single script that brings up infrastructure and starts the project in development mode.

**Design decisions:**
- Script: `scripts/start-dev.sh` (bash, `set -euo pipefail`)
- Mode: Development — Docker for postgres + redis only, `pnpm dev` for apps
- Infra: `docker compose up -d postgres redis` (leverages existing `docker-compose.yml`)
- DB setup: `db:generate` → `db:push` → all 3 seeds (categories, works, characters)
- `.env` created from `.env.example` if missing (user fills in secrets afterward)

---

## Task 1: Create `scripts/start-dev.sh`

**File:** `scripts/start-dev.sh` (executable, `chmod +x`)

### Step 1: Write script

```bash
#!/bin/bash
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── Helpers ─────────────────────────────────────────────────────────────────
info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── 1. Check Docker ──────────────────────────────────────────────────────────
info "Checking Docker..."
if ! command -v docker &> /dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/"
fi
if ! docker info &> /dev/null; then
  error "Docker is not running. Start Docker and try again."
fi
success "Docker is ready"

# ── 2. Setup .env ────────────────────────────────────────────────────────────
info "Setting up environment..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    success "Created .env from .env.example"
    warn "Please edit .env and fill in your secrets (DISCORD_*, JWT_SECRET, POSTGRES_PASSWORD)"
  else
    error ".env.example not found"
  fi
else
  info ".env already exists, skipping"
fi

# ── 3. Start infrastructure (postgres + redis only) ──────────────────────────
info "Starting infrastructure (postgres, redis)..."
docker compose up -d postgres redis
success "Infrastructure containers started"

# ── 4. Wait for services ────────────────────────────────────────────────────
info "Waiting for postgres to be ready..."
for i in {1..30}; do
  if docker exec anime-bot-postgres pg_isready -U "${POSTGRES_USER:-waifu}" -d "${POSTGRES_DB:-waifubot}" &> /dev/null; then
    success "Postgres is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    error "Postgres did not become ready in time"
  fi
  echo -n "."
  sleep 2
done

info "Waiting for redis to be ready..."
for i in {1..15}; do
  if docker exec anime-bot-redis redis-cli ping &> /dev/null; then
    success "Redis is ready"
    break
  fi
  if [ $i -eq 15 ]; then
    error "Redis did not become ready in time"
  fi
  echo -n "."
  sleep 2
done

# ── 5. Install dependencies ────────────────────────────────────────────────
info "Installing dependencies..."
if ! command -v pnpm &> /dev/null; then
  error "pnpm is not installed. Run: npm install -g pnpm"
fi
pnpm install --frozen-lockfile
success "Dependencies installed"

# ── 6. Database setup ──────────────────────────────────────────────────────
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
info "Starting development servers..."
info "Run 'docker compose logs -f' to watch container logs"
info "Press Ctrl+C to stop everything"
echo ""
success "All done! Starting turbo dev..."
echo ""
exec pnpm dev
```

### Step 2: Make executable

```bash
chmod +x scripts/start-dev.sh
```

### Step 3: Verify

- File exists: `ls -la scripts/start-dev.sh`
- Shebang correct: `head -1 scripts/start-dev.sh` → `#!/bin/bash`
- No syntax errors: `bash -n scripts/start-dev.sh` → silent

---

## Task 2: Add `start:dev` script to root `package.json`

**File:** `package.json` (modify scripts section)

Add `"start:dev": "./scripts/start-dev.sh"` to scripts.

**Verify:** `pnpm run start:dev --dry-run` (or equivalent)

---

## Task 3: Update `docs/DEVELOPMENT.md`

Add a section at the top referencing the new script:

```markdown
## Quick Start

```bash
# 1. Copy and fill in your secrets
cp .env.example .env
# Edit .env with your DISCORD_*, JWT_SECRET, POSTGRES_PASSWORD

# 2. Start everything (infra + dev servers)
./scripts/start-dev.sh

# Or via pnpm
pnpm start:dev
```
```

---

## Verification Checklist

- [ ] `scripts/start-dev.sh` exists and is executable
- [ ] `bash -n scripts/start-dev.sh` passes with no errors
- [ ] `package.json` has `start:dev` script
- [ ] `docs/DEVELOPMENT.md` references the new script
- [ ] Script handles: Docker not installed, Docker not running, `.env` already exists, services don't become healthy
