export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Character {
  id: string | number;
  name: string;
  series: string;
  image: string;
  rank?: number;
  rating: number;
  rarity: Rarity;
  description?: string;
  gender?: string;
  personality?: string;
  hairColor?: string;
  views?: number;
  trend?: { date: string; value: number }[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  collection: Character[];
  favorites: Character[];
}
