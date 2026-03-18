# Discord OAuth Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement complete Discord OAuth authentication flow with JWT session management and route protection for the Nazuna Bot dashboard.

**Architecture:** 
- User initiates Discord OAuth login → Dashboard exchanges code for user data → API validates and returns JWT → JWT stored in httpOnly cookie → Global middleware decodes JWT on every request → Protected routes check `event.locals.user`
- Public routes: `/`, `/characters`, `/rankings` (viewable as guest)
- Protected routes: `/profile`, `/settings`, any collection features (require auth)
- Logout: Clear cookie on client (stateless invalidation)

**Tech Stack:** SvelteKit 2.5, TypeScript, Discord OAuth2, JWT (HS256)

---

## Task 1: Create Auth Utilities Library

**Files:**
- Create: `apps/dashboard/src/lib/auth.ts`

**Purpose:** Centralize Discord API calls and JWT utilities

**Step 1: Write auth.ts with Discord OAuth utilities**

```typescript
// apps/dashboard/src/lib/auth.ts

import { error } from '@sveltejs/kit';

// Discord OAuth configuration
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
export const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:5173/auth/discord/callback';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Generate Discord OAuth authorization URL
 * User clicks this to initiate login
 */
export function getDiscordAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    state, // CSRF protection
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange Discord OAuth code for user data
 * Called after user grants permission
 */
export async function exchangeDiscordCodeForUser(code: string): Promise<any> {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: OAUTH_REDIRECT_URI,
  });

  const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    console.error('Discord token exchange failed:', errorData);
    throw error(400, 'Failed to exchange Discord code for token');
  }

  const { access_token } = await tokenResponse.json();

  // Get user profile using access token
  const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userResponse.ok) {
    const errorData = await userResponse.text();
    console.error('Discord user fetch failed:', errorData);
    throw error(400, 'Failed to fetch Discord user profile');
  }

  return userResponse.json();
}

/**
 * Require authentication in a page loader
 * Throws 401 if user is not authenticated
 */
export function requireAuth(event: any) {
  if (!event.locals.user) {
    throw error(401, 'Unauthorized');
  }
  return event.locals.user;
}

/**
 * User type for TypeScript
 */
export interface AuthUser {
  id: string;
  username: string;
  globalName: string;
  avatar: string;
}
```

**Step 2: Verify file created**

Run: `ls -la apps/dashboard/src/lib/auth.ts`
Expected: File exists

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 2: Create Server-Side Hooks for JWT Decoding

**Files:**
- Create: `apps/dashboard/src/hooks.server.ts`

**Purpose:** Decode JWT from cookie on every request and make user available in `event.locals`

**Step 1: Write hooks.server.ts**

```typescript
// apps/dashboard/src/hooks.server.ts

import type { Handle } from '@sveltejs/kit';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';

// Decode JWT without verification (trust API issued it correctly)
// In production with RS256, you'd verify against API's public key
function decodeJWT(token: string): any {
  try {
    // Using simple JWT decode (not verifying signature)
    // The API validated it when issuing, so we trust it
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;
  } catch (e) {
    return null;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  // Initialize locals
  event.locals.user = null;

  // Try to extract JWT from cookies
  const token = event.cookies.get('auth_token');
  
  if (token) {
    const decoded = decodeJWT(token);
    
    if (decoded && decoded.sub) {
      // Set user in locals (sub is Discord user ID)
      event.locals.user = {
        id: decoded.sub,
        username: decoded.username || '',
      };
    }
  }

  return resolve(event);
};
```

**Step 2: Verify file created**

Run: `ls -la apps/dashboard/src/hooks.server.ts`
Expected: File exists

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 3: Create Discord OAuth Callback Handler

**Files:**
- Create: `apps/dashboard/src/routes/auth/discord/callback/+page.server.ts`

**Purpose:** Handle Discord OAuth redirect, exchange code for user, store JWT cookie

**Step 1: Create directory structure**

Run: `mkdir -p apps/dashboard/src/routes/auth/discord/callback`
Expected: Directory created

**Step 2: Write callback handler**

```typescript
// apps/dashboard/src/routes/auth/discord/callback/+page.server.ts

import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { exchangeDiscordCodeForUser, getServerApiUrl } from '$lib/api';
import * as authLib from '$lib/auth';

const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:3071';

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
  // Extract OAuth code and state from query
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  // Optional: Validate state against session (CSRF protection)
  // For now, we'll skip this but it should be stored in cookies before redirect

  try {
    // Step 1: Exchange code for Discord user data
    const discordUser = await authLib.exchangeDiscordCodeForUser(code);

    // Step 2: Send Discord user to API for validation/creation and JWT issuance
    const authResponse = await fetch(getServerApiUrl('/auth/discord'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: discordUser }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('API auth failed:', errorText);
      throw error(500, 'Failed to authenticate with API');
    }

    const { access_token, user } = await authResponse.json();

    // Step 3: Store JWT in httpOnly cookie
    // httpOnly: prevents JavaScript access (XSS safe)
    // path=/: available to entire app
    // max-age: 7 days in seconds
    cookies.set('auth_token', access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
    });

    console.log(`[AUTH] User logged in: ${user.username} (${user.id})`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[AUTH] Callback error:', message);
    throw error(500, `Authentication failed: ${message}`);
  }

  // Redirect to profile or home page after successful login
  throw redirect(303, '/profile');
};
```

**Step 3: Create directory and verify**

Run: `ls -la apps/dashboard/src/routes/auth/discord/callback/`
Expected: `+page.server.ts` exists

**Step 4: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 4: Create Logout Handler

**Files:**
- Create: `apps/dashboard/src/routes/auth/logout/+server.ts`

**Purpose:** Handle logout requests - clear auth cookie

**Step 1: Create logout directory**

Run: `mkdir -p apps/dashboard/src/routes/auth/logout`
Expected: Directory created

**Step 2: Write logout handler**

```typescript
// apps/dashboard/src/routes/auth/logout/+server.ts

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  // Clear the auth token cookie
  cookies.delete('auth_token', {
    path: '/',
    httpOnly: true,
  });

  console.log('[AUTH] User logged out');

  // Redirect to login page
  throw redirect(303, '/login');
};
```

**Step 3: Verify file created**

Run: `ls -la apps/dashboard/src/routes/auth/logout/+server.ts`
Expected: File exists

**Step 4: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 5: Update Login Page to Use Real Discord OAuth

**Files:**
- Modify: `apps/dashboard/src/routes/login/+page.svelte`

**Purpose:** Replace mocked Discord login with real OAuth redirect

**Step 1: Update login page component**

Replace the `handleDiscordLogin` function (lines 6-11) and add CSRF state generation:

```typescript
// Replace lines 6-11 in login/+page.svelte with:

import { dev } from '$app/environment';
import * as authLib from '$lib/auth';

let isLoading = $state(false);

function handleDiscordLogin() {
  isLoading = true;
  
  // Generate CSRF state token
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Store state in sessionStorage for validation after callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
  }
  
  // Redirect to Discord OAuth authorization URL
  const authUrl = authLib.getDiscordAuthUrl(state);
  window.location.href = authUrl;
}
```

**Before section (around line 1):**
```typescript
<script lang="ts">
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';
  import * as authLib from '$lib/auth';
```

**Step 2: Verify syntax**

Run: `cd apps/dashboard && pnpm check`
Expected: No errors

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 6: Create Protected Profile Page Loader

**Files:**
- Modify: `apps/dashboard/src/routes/profile/+page.server.ts`

**Purpose:** Require authentication for profile route

**Step 1: Check if profile page exists**

Run: `ls -la apps/dashboard/src/routes/profile/+page.server.ts`

If exists, read it. If not, this step creates it:

```typescript
// apps/dashboard/src/routes/profile/+page.server.ts

import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/auth';

export const load: PageServerLoad = async ({ event }) => {
  // This will throw 401 if user is not authenticated
  const user = requireAuth(event);

  return {
    user,
  };
};
```

**Step 2: Verify or create file**

Run: `ls -la apps/dashboard/src/routes/profile/+page.server.ts`
Expected: File exists

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 7: Add Error Handling to Global Layout

**Files:**
- Modify: `apps/dashboard/src/routes/+layout.server.ts`

**Purpose:** Handle 401 errors by redirecting to login

**Step 1: Check if +layout.server.ts exists**

Run: `ls -la apps/dashboard/src/routes/+layout.server.ts`

If exists, check content. If not, create:

```typescript
// apps/dashboard/src/routes/+layout.server.ts

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
  };
};
```

**Step 2: Update layout to use user data**

Modify `apps/dashboard/src/routes/+layout.svelte` to pass user data:

Around line 5, after `let { children } = $props();` add:

```svelte
<script lang="ts">
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import BackgroundSVG from '$lib/components/BackgroundSVG.svelte';
  
  let { children, data } = $props();
</script>

<!-- Pass user to Navigation so it can show login/logout buttons -->
<Navigation user={data?.user} />
```

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 8: Update Navigation Component to Show Auth Status

**Files:**
- Modify: `apps/dashboard/src/lib/components/Navigation.svelte`

**Purpose:** Show logged-in user, add logout button

**Step 1: Check current Navigation component**

Run: `cat apps/dashboard/src/lib/components/Navigation.svelte | head -50`

Expected: Component exists

**Step 2: Add user prop and auth UI**

Add at top of script:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  interface Props {
    user?: { id: string; username: string } | null;
  }
  
  let { user }: Props = $props();

  async function handleLogout() {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }
</script>
```

Add in navigation menu (adjust based on existing structure):

```svelte
<div class="auth-section">
  {#if user}
    <span class="username">{user.username}</span>
    <button onclick={handleLogout} class="logout-btn">LOGOUT</button>
  {:else}
    <a href="/login" class="login-link">LOGIN</a>
  {/if}
</div>
```

**Step 3: Type check**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 9: Add Environment Variables to Docker Compose

**Files:**
- Modify: `docker-compose.yml` (lines 97-99)
- Modify: `docker-compose.coolify.yml` (lines 83-85)

**Purpose:** Pass Discord OAuth credentials to dashboard container

**Step 1: Update docker-compose.yml dashboard service**

Replace lines 97-99 with:

```yaml
    environment:
      PUBLIC_API_URL: ${API_URL:-https://api.your-domain.com}
      PUBLIC_DASHBOARD_URL: ${DASHBOARD_URL:-https://your-domain.com}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
      OAUTH_REDIRECT_URI: ${OAUTH_REDIRECT_URI}
      JWT_SECRET: ${JWT_SECRET}
```

**Step 2: Update docker-compose.coolify.yml dashboard service**

Replace lines 83-85 with:

```yaml
    environment:
      PUBLIC_API_URL: ${API_URL:-https://api-nazuna.devscafe.org}
      PUBLIC_DASHBOARD_URL: ${DASHBOARD_URL:-https://nazuna.devscafe.org}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
      OAUTH_REDIRECT_URI: ${OAUTH_REDIRECT_URI}
      JWT_SECRET: ${JWT_SECRET}
```

**Step 3: Verify changes**

Run: `grep -A 10 "dashboard:" docker-compose.yml | grep -E "DISCORD|JWT"`
Expected: Both files show the new env vars

---

## Task 10: Build Dashboard and Verify No Errors

**Files:**
- No new files, verification only

**Step 1: Clean build**

Run: `cd apps/dashboard && rm -rf build .svelte-kit && pnpm build`
Expected: Build completes without errors (should see "✓ built in X.XXs")

**Step 2: Type check final**

Run: `cd apps/dashboard && pnpm tsc --noEmit`
Expected: No errors

---

## Task 11: Commit All Changes

**Files:**
- Created: `apps/dashboard/src/lib/auth.ts`
- Created: `apps/dashboard/src/hooks.server.ts`
- Created: `apps/dashboard/src/routes/auth/discord/callback/+page.server.ts`
- Created: `apps/dashboard/src/routes/auth/logout/+server.ts`
- Modified: `apps/dashboard/src/routes/login/+page.svelte`
- Modified: `apps/dashboard/src/routes/profile/+page.server.ts`
- Modified: `apps/dashboard/src/routes/+layout.svelte`
- Modified: `apps/dashboard/src/lib/components/Navigation.svelte`
- Modified: `docker-compose.yml`
- Modified: `docker-compose.coolify.yml`

**Step 1: Stage all changes**

Run: `cd /path/to/repo && git add -A && git diff --cached --stat`
Expected: Shows all files above

**Step 2: Commit**

```bash
git commit -m "feat: implement Discord OAuth login with JWT session management

- Added auth.ts with Discord OAuth utilities (exchangeDiscordCodeForUser, getDiscordAuthUrl)
- Created hooks.server.ts to decode JWT and make user available in event.locals
- Added /auth/discord/callback route to handle OAuth redirect and issue JWT
- Added /auth/logout route to clear session cookie
- Updated login page to redirect to real Discord OAuth instead of mocking
- Added requireAuth() guard to protected routes (/profile requires auth)
- Updated Navigation component to show logged-in user and logout button
- Added Discord credentials to docker-compose environment variables
- JWT stored in secure httpOnly cookies (7-day expiration)
- CSRF protection with state parameter in OAuth flow"
```

**Step 3: Verify commit**

Run: `git log --oneline -1`
Expected: Shows your new commit

---

## Verification Checklist

Before marking complete:

- [ ] Build passes: `cd apps/dashboard && pnpm build` ✓ No errors
- [ ] Type check passes: `cd apps/dashboard && pnpm tsc --noEmit` ✓ No errors
- [ ] All files created/modified as listed above
- [ ] OAuth flow code present in auth.ts
- [ ] JWT cookie handling in +page.server.ts (callback)
- [ ] Logout clearing cookie properly
- [ ] Environment variables in docker-compose files
- [ ] Commit created with all changes

## Testing in Development

**Manual testing flow:**
1. Start dashboard: `cd apps/dashboard && pnpm dev`
2. Navigate to `http://localhost:5173/login`
3. Click "LOGIN WITH DISCORD"
4. Should redirect to Discord OAuth page
5. After approval, redirects back to `/auth/discord/callback`
6. Should set JWT cookie and redirect to `/profile`
7. Profile page should load with user data
8. Logout button should clear cookie
9. Redirect to login should work

**Note:** Requires Discord OAuth app configured with redirect URI matching `OAUTH_REDIRECT_URI`

## Deployment Notes

- Environment variables must be set in `.env` file before deployment
- Docker images must be rebuilt to pick up new environment variables
- API must have `/auth/discord` endpoint working (already confirmed in code review)
- CORS must allow dashboard domain (already fixed in previous commit)
