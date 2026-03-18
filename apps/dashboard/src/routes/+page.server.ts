import type { PageServerLoad } from './$types';
import { api } from '$lib/api';
import { getMockCharacters, getMockRankings, getMockStats } from '$lib/mockData';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    // Try to fetch from API
    const [rankingsRes, charactersRes] = await Promise.all([
      fetch('/api/v1/rankings/combined?page=1&limit=4'),
      fetch('/api/v1/characters?page=1&limit=50'),
    ]);

    if (rankingsRes.ok && charactersRes.ok) {
      const rankings = await rankingsRes.json();
      const characters = await charactersRes.json();
      
      // Ensure stats is always defined
      const stats = {
        totalCharacters: characters.pagination?.total || 0,
        activeUsers: 85420,
        servers: 1240,
        collections: 1250000,
      };
      
      return {
        topCharacters: (rankings.data || []).slice(0, 4),
        stats,
        source: 'api' as const,
      };
    }
  } catch (e) {
    console.warn('API unavailable, using mock data:', e);
  }
  
  // Fallback to mock data
  return {
    topCharacters: getMockRankings('popularity').slice(0, 4),
    stats: getMockStats(),
    source: 'mock' as const,
  };
};
