import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const DISCORD_CLIENT_ID = env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = env.DISCORD_CLIENT_SECRET;
const PUBLIC_API_URL = env.PUBLIC_API_URL || 'http://localhost:3001';
const REDIRECT_URI = env.NODE_ENV === 'production' 
  ? 'https://nazuna.devscafe.org/auth/discord/callback'
  : `${PUBLIC_API_URL}/auth/discord/callback`;

export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  
  if (!code) {
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordAuthUrl.searchParams.set('client_id', DISCORD_CLIENT_ID || '');
    discordAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    discordAuthUrl.searchParams.set('response_type', 'code');
    discordAuthUrl.searchParams.set('scope', 'identify email');
    
    throw redirect(302, discordAuthUrl.toString());
  }

  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID || '',
      client_secret: DISCORD_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  
  const user = await userResponse.json();

  cookies.set('session', JSON.stringify({
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
  }), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });

  throw redirect(302, '/');
};
