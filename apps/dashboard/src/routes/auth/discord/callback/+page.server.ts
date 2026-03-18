// apps/dashboard/src/routes/auth/discord/callback/+page.server.ts

import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServerApiUrl } from '$lib/api';
import { exchangeDiscordCodeForUser } from '$lib/auth';

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
  // Extract OAuth code and state from query
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    throw error(400, 'Missing authorization code');
  }

  try {
    // Step 1: Exchange code for Discord user data
    const discordUser = await exchangeDiscordCodeForUser(code);

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
