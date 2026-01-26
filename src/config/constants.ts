import { RarityConfig, GameConfig } from '../types/game.js';

// Rarity configuration
export const RARITY_CONFIG: Record<string, RarityConfig> = {
  common: {
    name: 'Comum',
    emoji: '⚪',
    color: 0x9e9e9e,
    weight: 60,
  },
  uncommon: {
    name: 'Incomum',
    emoji: '🟢',
    color: 0x4caf50,
    weight: 25,
  },
  rare: {
    name: 'Raro',
    emoji: '🔵',
    color: 0x2196f3,
    weight: 10,
  },
  epic: {
    name: 'Épico',
    emoji: '🟣',
    color: 0x9c27b0,
    weight: 4,
  },
  legendary: {
    name: 'Lendário',
    emoji: '🟡',
    color: 0xffc107,
    weight: 1,
  },
};

// Game configuration
export const GAME_CONFIG: GameConfig = {
  maxRollsPerHour: parseInt(process.env.MAX_ROLLS_PER_HOUR || '11'),
  rollRecoveryMinutes: parseInt(process.env.ROLL_RECOVERY_MINUTES || '15'),
  maxClaimsPerDay: 3,
  claimCooldownMinutes: parseInt(process.env.CLAIM_COOLDOWN_MINUTES || '30'),
  dailyCoins: parseInt(process.env.DAILY_COINS || '1000'),
  rollCost: parseInt(process.env.ROLL_COST || '100'),
  giftFeePercent: 5,
  bankWithdrawLimit: 10000,
};

// Battle stats by rarity
export const BATTLE_STATS: Record<string, { attack: number; defense: number; speed: number; hp: number }> = {
  common: { attack: 40, defense: 35, speed: 30, hp: 100 },
  uncommon: { attack: 55, defense: 50, speed: 45, hp: 130 },
  rare: { attack: 75, defense: 70, speed: 65, hp: 170 },
  epic: { attack: 100, defense: 95, speed: 90, hp: 220 },
  legendary: { attack: 130, defense: 125, speed: 120, hp: 280 },
};

// Level multiplier for battles (5% per level)
export const LEVEL_MULTIPLIER = 0.05;

// ELO K-factor
export const ELO_K_FACTOR = 32;

// API URL
export const CHARLIB_API_URL = process.env.CHARLIB_API_URL || 'https://charlib.vercel.app/api';

// Embed colors
export const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  warning: 0xfee75c,
  error: 0xed4245,
  info: 0x5865f2,
  common: 0x9e9e9e,
  uncommon: 0x4caf50,
  rare: 0x2196f3,
  epic: 0x9c27b0,
  legendary: 0xffc107,
};

// Rarity colors for embeds (uppercase keys for DB enum matching)
export const RARITY_COLORS: Record<string, number> = {
  COMMON: 0x9e9e9e,
  UNCOMMON: 0x4caf50,
  RARE: 0x2196f3,
  EPIC: 0x9c27b0,
  LEGENDARY: 0xffc107,
};

// Rarity emojis (uppercase keys for DB enum matching)
export const RARITY_EMOJIS: Record<string, string> = {
  COMMON: '⚪',
  UNCOMMON: '🟢',
  RARE: '🔵',
  EPIC: '🟣',
  LEGENDARY: '🟡',
};

// Work options for /work command
export const WORK_OPTIONS: Record<string, {
  name: string;
  emoji: string;
  minReward: number;
  maxReward: number;
  cooldownMinutes: number;
}> = {
  stream: {
    name: 'Stream',
    emoji: '🎮',
    minReward: 50,
    maxReward: 150,
    cooldownMinutes: 30,
  },
  freelance: {
    name: 'Freelance',
    emoji: '📝',
    minReward: 80,
    maxReward: 200,
    cooldownMinutes: 60,
  },
  office: {
    name: 'Escritório',
    emoji: '🏢',
    minReward: 150,
    maxReward: 350,
    cooldownMinutes: 120,
  },
  business: {
    name: 'Empresa',
    emoji: '💼',
    minReward: 300,
    maxReward: 600,
    cooldownMinutes: 240,
  },
  mission: {
    name: 'Missão',
    emoji: '🎯',
    minReward: 500,
    maxReward: 1000,
    cooldownMinutes: 480,
  },
};

// Lucky game probabilities
export const LUCKY_PROBABILITIES = {
  jackpot: 0.01,      // 1% - personagem raro grátis
  bigWin: 0.05,       // 5% - 500 coins
  mediumWin: 0.15,    // 15% - 200 coins
  smallWin: 0.30,     // 30% - 50 coins
  nothing: 0.49,      // 49% - nada
};

// Shop items
export const DEFAULT_SHOP_ITEMS = [
  {
    type: 'extra_roll',
    name: '🎲 Roll Extra',
    description: 'Ganhe 1 roll adicional',
    priceCoins: 500,
    priceGems: 0,
    dailyLimit: 5,
  },
  {
    type: 'extra_claim',
    name: '❤️ Claim Extra',
    description: 'Ganhe 1 claim adicional',
    priceCoins: 2000,
    priceGems: 0,
    dailyLimit: 2,
  },
  {
    type: 'reroll_token',
    name: '🔄 Token de Reroll',
    description: 'Permite fazer um reroll gratuitamente',
    priceCoins: 1000,
    priceGems: 0,
    dailyLimit: 3,
  },
];
