import type { Character, RankingCharacter, CharacterMetrics } from './api';
import { generateMockCharacters, generateMockCharacter } from './api';

// Fallback mock data for when API is unavailable
const MOCK_CHARACTERS = generateMockCharacters(50);

export function getMockCharacters(): Character[] {
  return MOCK_CHARACTERS;
}

export function getMockCharacter(id: number | string): Character | undefined {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  return MOCK_CHARACTERS.find(c => c.id === numericId) || generateMockCharacter(numericId, numericId);
}

export function getMockRelatedCharacters(excludeId: number): Character[] {
  return MOCK_CHARACTERS
    .filter(c => c.id !== excludeId)
    .slice(0, 3);
}

export function getMockRankings(type: 'popularity' | 'ratings' | 'combined' = 'popularity'): RankingCharacter[] {
  let sorted = [...MOCK_CHARACTERS];
  
  if (type === 'popularity') {
    sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else if (type === 'ratings') {
    sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else {
    sorted.sort((a, b) => ((b.popularity || 0) * (b.score || 0)) - ((a.popularity || 0) * (a.score || 0)));
  }
  
  return sorted.map((char, idx) => ({
    ...char,
    rank: idx + 1,
  }));
}

export function getMockMetrics(characterId: number): CharacterMetrics {
  return {
    globalRank: Math.floor(Math.random() * 100) + 1,
    totalClaims: Math.floor(Math.random() * 5000) + 100,
    totalFavorites: Math.floor(Math.random() * 1000) + 50,
  };
}

export function getMockVolume(months: number = 6) {
  return Array.from({ length: months }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(new Date().getMonth() - (months - 1 - i) + 12) % 12],
    year: new Date().getFullYear(),
    count: Math.floor(Math.random() * 500) + 50,
  }));
}

export function getMockStats() {
  return {
    totalCharacters: 12450,
    activeUsers: 15420,
    servers: 1240,
    collections: 1250430,
  };
}

export function getMockDistribution() {
  return {
    gender: [
      { name: 'Female', value: 65 },
      { name: 'Male', value: 30 },
      { name: 'Non-binary', value: 3 },
      { name: 'Other', value: 2 },
    ],
    role: [
      { name: 'Protagonist', value: 40 },
      { name: 'Supporting', value: 35 },
      { name: 'Antagonist', value: 15 },
      { name: 'Other', value: 10 },
    ],
  };
}

export function getMockLedger() {
  return [
    { id: '1', userId: 'user1', username: 'Pedro', action: 'roulette_spin', character: 'Nazuna Nanakusa', time: '2 mins ago' },
    { id: '2', userId: 'user2', username: 'Kaleb', action: 'character_obtained', character: 'Makima', time: '5 mins ago' },
    { id: '3', userId: 'user3', username: 'Alex', action: 'favorite_added', character: 'Power', time: '12 mins ago' },
    { id: '4', userId: 'user4', username: 'Sarah', action: 'rating_submitted', character: 'Yor Forger', time: '15 mins ago' },
    { id: '5', userId: 'user5', username: 'Mike', action: 'character_traded', character: 'Marin Kitagawa', time: '22 mins ago' },
  ];
}

// Filter helpers
export function filterCharacters(
  characters: Character[],
  filters: {
    search?: string;
    gender?: string;
    hairColor?: string;
    rarity?: string;
    sortBy?: string;
  }
): Character[] {
  let filtered = [...characters];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(search) || 
      (c.series?.toLowerCase().includes(search))
    );
  }
  
  if (filters.gender && filters.gender !== 'All') {
    filtered = filtered.filter(c => c.gender === filters.gender);
  }
  
  if (filters.hairColor && filters.hairColor !== 'All') {
    filtered = filtered.filter(c => c.hairColor === filters.hairColor);
  }
  
  if (filters.rarity && filters.rarity !== 'All') {
    filtered = filtered.filter(c => c.rarity === filters.rarity);
  }
  
  // Sort
  switch (filters.sortBy) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
    case 'views':
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'rank':
    default:
      filtered.sort((a, b) => (a.rank || 999) - (b.rank || 999));
      break;
  }
  
  return filtered;
}
