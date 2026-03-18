import { env } from '$env/dynamic/public';

const API_BASE = env.PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  characters: {
    list: (params: Record<string, string | number> = {}) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchApi<any>(`/characters${query ? `?${query}` : ''}`);
    },
    
    get: (id: number) => fetchApi<any>(`/characters/${id}`),
    
    getMetrics: (id: number) => fetchApi<any>(`/characters/${id}/metrics`),
    
    getRelated: (id: number, limit: number = 5) => 
      fetchApi<any>(`/characters/${id}/related?limit=${limit}`),
    
    getVolume: (id: number, months: number = 6) => 
      fetchApi<any>(`/characters/${id}/volume?months=${months}`),
    
    random: (filters: Record<string, string> = {}) => {
      const query = new URLSearchParams(filters).toString();
      return fetchApi<any>(`/characters/random${query ? `?${query}` : ''}`);
    },
  },

  ratings: {
    get: (characterId: number) => fetchApi<any>(`/ratings/character/${characterId}`),
    
    submit: (userId: string, characterId: number, rating: number) =>
      fetchApi<any>('/ratings', {
        method: 'POST',
        body: { userId, characterId, rating },
      }),
  },

  favorites: {
    list: (userId: string) => fetchApi<any>(`/favorites/${userId}`),
    
    add: (userId: string, characterId: number) =>
      fetchApi<any>('/favorites', {
        method: 'POST',
        body: { userId, characterId },
      }),
    
    remove: (userId: string, characterId: number) =>
      fetchApi<any>(`/favorites/${characterId}`, {
        method: 'DELETE',
        body: { userId },
      }),
  },
};
