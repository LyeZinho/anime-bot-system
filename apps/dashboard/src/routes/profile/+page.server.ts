import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { getServerApiUrl } from '$lib/api';
import { getMockCharacters } from '$lib/mockData';

export const load: PageServerLoad = async ({ locals, fetch }) => {
  // Require authentication for profile page
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  try {
    // Fetch user profile from API
    const profileRes = await fetch(getServerApiUrl(`/users/me?userId=${locals.user.id}`));
    const profile = profileRes.ok ? await profileRes.json() : null;

    // Fetch user collection
    const collectionRes = await fetch(getServerApiUrl(`/users/me/collections?userId=${locals.user.id}`));
    const collection = collectionRes.ok ? await collectionRes.json() : [];
    
    // Fetch user favorites
    const favoritesRes = await fetch(getServerApiUrl(`/users/me/favorites?userId=${locals.user.id}`));
    const favorites = favoritesRes.ok ? await favoritesRes.json() : [];

    return {
      user: {
        id: locals.user.id,
        username: locals.user.username,
        avatar: profile?.avatar || null,
        memberSince: profile?.createdAt || 'Unknown',
      },
      collection: Array.isArray(collection) ? collection.slice(0, 10) : [],
      favorites: Array.isArray(favorites) ? favorites.slice(0, 10) : [],
      stats: {
        collectionCount: Array.isArray(collection) ? collection.length : 0,
        favoritesCount: Array.isArray(favorites) ? favorites.length : 0,
      },
      activities: profile?.activities || [],
      source: 'api' as const,
    };
  } catch (e) {
    console.warn('Failed to fetch profile from API, using mock data:', e);
    // Fallback to minimal user data on API failure
    return {
      user: {
        id: locals.user.id,
        username: locals.user.username,
        avatar: null,
        memberSince: 'Unknown',
      },
      collection: [],
      favorites: [],
      stats: {
        collectionCount: 0,
        favoritesCount: 0,
      },
      activities: [],
      source: 'mock' as const,
    };
  }
};
