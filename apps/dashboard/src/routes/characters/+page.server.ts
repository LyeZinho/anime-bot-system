import type { PageServerLoad } from './$types';
import { getServerApiUrl } from '$lib/api';

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get('search') || '';
  const gender = url.searchParams.get('gender') || '';
  const hairColor = url.searchParams.get('hairColor') || '';
  const rarity = url.searchParams.get('rarity') || '';
  const sortBy = url.searchParams.get('sortBy') || 'rank';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 100;

  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (gender) params.set('gender', gender);
    if (hairColor) params.set('hairColor', hairColor);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await fetch(getServerApiUrl(`/characters?${params.toString()}`));

    if (response.ok) {
      const result = await response.json();

      const seen = new Set<number | string>();
      const uniqueCharacters = (result.data || []).filter((char: any) => {
        const id = char.id ?? char.anilistId;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return {
        characters: uniqueCharacters,
        pagination: {
          page: result.pagination?.page ?? page,
          limit: result.pagination?.limit ?? limit,
          total: result.pagination?.total ?? 0,
          totalPages: result.pagination?.totalPages ?? 0,
        },
        filters: { search, gender, hairColor, rarity, sortBy },
        source: 'api' as const,
      };
    }
  } catch (e) {
    console.warn('API unavailable, using mock data:', e);
  }

  return {
    characters: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
    filters: { search, gender, hairColor, rarity, sortBy },
    source: 'mock' as const,
  };
};
