// API Character from CharLib
export interface APICharacter {
  id: string;
  name: string;
  workId: string;
  workTitle: string;
  // Compatibilidade: algumas partes do código usam `workName`
  workName?: string;
  workType: 'anime' | 'manga' | 'game';
  role: string;
  score: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image: string | null;
  // Compatibilidade: algumas partes do código esperam `imageUrl`
  imageUrl?: string | null;
  // Raw payload da API quando necessário
  apiData?: any;
  rank: number;
  weight: number;
  pullChance: number;
}

// API Work from CharLib
export interface APIWork {
  id: string;
  slug: string;
  title: string;
  type: 'anime' | 'manga' | 'game';
  description?: string;
  coverImage?: string;
  characters?: APICharacter[];
}

// API Ranking response
export interface APIRankingResponse {
  characters: APICharacter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Config interfaces
export interface RarityConfig {
  name: string;
  emoji: string;
  color: number;
  weight: number;
}

export interface GameConfig {
  maxRollsPerHour: number;
  rollRecoveryMinutes: number;
  maxClaimsPerDay: number;
  claimCooldownMinutes: number;
  dailyCoins: number;
  rollCost: number;
  giftFeePercent: number;
  bankWithdrawLimit: number;
}

// Battle interfaces
export interface BattleStats {
  attack: number;
  defense: number;
  hp: number;
}

export interface BattleCard {
  id: number;
  name: string;
  rarity: string;
  imageUrl?: string;
  stats: BattleStats;
}

export interface RoundLog {
  round: number;
  attackerCard: BattleCard;
  defenderCard: BattleCard;
  damage: number;
  winner: 'challenger' | 'opponent';
}

export interface BattleResult {
  battleId: number;
  winnerId: string | null;
  challengerHP: number;
  opponentHP: number;
  rounds: RoundLog[];
  challengerRatingChange: number;
  opponentRatingChange: number;
}
