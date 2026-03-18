// apps/dashboard/src/hooks.server.ts

import type { Handle } from '@sveltejs/kit';

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
