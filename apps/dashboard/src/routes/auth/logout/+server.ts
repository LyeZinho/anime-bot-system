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
