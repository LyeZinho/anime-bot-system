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
