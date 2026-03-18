# Dashboard API Connection Fix

## Problem Identified
The dashboard was displaying only hardcoded mock data instead of consuming real API data. The root cause was:

1. **Hardcoded relative path**: `api.ts` used `const API_BASE = '/api/v1'`
2. **In Docker**: Relative paths resolve to `localhost:3173/api/v1` (dashboard's own port)
3. **Actual API**: Runs on separate container `api:3071`
4. **Result**: API calls failed silently; dashboard fell back to mock data

## Solution Implemented

### 1. Environment-Based API URL (`apps/dashboard/src/lib/api.ts`)
- Added `getServerApiUrl(endpoint)` helper for server-side fetches
- Server-side code now reads `PUBLIC_API_URL` environment variable
- Client-side code maintains `/api/v1` fallback for SvelteKit dev proxy

```typescript
// Server-side: Uses PUBLIC_API_URL environment variable
const API_BASE = typeof window === 'undefined'
  ? (process.env.PUBLIC_API_URL || 'http://localhost:3071') + '/api/v1'
  : '/api/v1';

// Helper for server loaders
export function getServerApiUrl(endpoint: string): string {
  const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3071';
  return `${baseUrl}/api/v1${endpoint}`;
}
```

### 2. Updated All Page Loaders
Updated all SvelteKit page server loaders to use `getServerApiUrl()`:

- `src/routes/+page.server.ts` - Home page (rankings, stats)
- `src/routes/characters/+page.server.ts` - Character grid
- `src/routes/characters/[id]/+page.server.ts` - Character detail + actions
- `src/routes/statistics/+page.server.ts` - Statistics page

### 3. Fixed Docker Compose Configuration
**docker-compose.yml**:
- Changed API's `CORS_ORIGIN` from `${DOMAIN}` to `${DASHBOARD_URL}`
- Ensures CORS headers allow requests from dashboard

**Environment Variables** (already set correctly):
- Dashboard: `PUBLIC_API_URL=${API_URL:-https://api.your-domain.com}`
- API: `CORS_ORIGIN=${DASHBOARD_URL:-https://your-domain.com}`

## How It Works

### Development (SvelteKit Dev Server)
1. Dashboard runs on `localhost:3173`
2. SvelteKit dev server acts as reverse proxy for `/api/v1` → `http://localhost:3071`
3. Both server and client code works transparently

### Production (Docker)
1. Dashboard container starts with env: `PUBLIC_API_URL=http://api:3071`
2. Server-side loaders use `http://api:3071/api/v1` (correct container URL)
3. Client-side falls back to `/api/v1` (browser proxy not available)
4. API container receives requests from dashboard via Docker network
5. API responds with CORS headers allowing the request

## Verification Steps

After deployment, verify:

1. **Dashboard starts without errors**: Check container logs for crash
   ```bash
   docker logs anime-bot-dashboard
   ```

2. **Network requests succeed**: Check DevTools Network tab in browser
   - Open: http://dashboard:3173 (or your domain)
   - Check Network tab
   - All `/api/v1/*` requests should return 200 (not 404/CORS errors)

3. **Real data displays**: 
   - Home page shows real character stats
   - Stats show "8,784 Total Characters" (real database count)
   - Character grid loads with real data
   - Character detail pages display real information

4. **Fallback still works**: If API is down, mock data should display
   - Check browser console for "API unavailable" warning
   - UI should still be responsive with mock data

## Files Changed
- ✅ `apps/dashboard/src/lib/api.ts`
- ✅ `apps/dashboard/src/routes/+page.server.ts`
- ✅ `apps/dashboard/src/routes/characters/+page.server.ts`
- ✅ `apps/dashboard/src/routes/characters/[id]/+page.server.ts`
- ✅ `apps/dashboard/src/routes/statistics/+page.server.ts`
- ✅ `docker-compose.yml`

## Commit
**cf21e55**: `fix: dashboard API client uses environment-based URL for cross-container networking`

## Environment Variables (Required)
For deployment to work, these must be set:

```env
# For docker-compose.yml (local development)
API_URL=http://api:3071
DASHBOARD_URL=http://localhost:3173

# For docker-compose.coolify.yml (Coolify deployment)
API_URL=https://api-nazuna.devscafe.org
DASHBOARD_URL=https://nazuna.devscafe.org
```

The `PUBLIC_API_URL` environment variable is automatically set by docker-compose from `API_URL`.
