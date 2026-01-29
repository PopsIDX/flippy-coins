import type { CoinType, Upgrade } from '../types/game';

// Coin type definitions
export const COIN_TYPES: Record<string, CoinType> = {
  basic: {
    id: 'basic',
    name: 'Bronze Coin',
    baseValue: 1,
    baseCost: 6,
    flipDuration: 1200,
  },
  silver: {
    id: 'silver',
    name: 'Silver Coin',
    baseValue: 5,
    baseCost: 50,
    flipDuration: 1100,
  },
  gold: {
    id: 'gold',
    name: 'Gold Coin',
    baseValue: 25,
    baseCost: 300,
    flipDuration: 1000,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Coin',
    baseValue: 100,
    baseCost: 1500,
    flipDuration: 900,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Coin',
    baseValue: 400,
    baseCost: 7500,
    flipDuration: 800,
  },
};

// Initial upgrade definitions
export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'golden_touch',
    name: 'Golden Touch',
    description: 'Increases earnings per flip by 25%',
    multiplier: 0.25,
    baseCost: 30,
    level: 0,
    maxLevel: 10,
  },
];

// Cost scaling factors
export const COIN_COST_MULTIPLIER = 1.2;
export const UPGRADE_COST_MULTIPLIER = 1.6;

// Auto-clicker costs (expensive one-time purchase per coin type)
export const AUTO_CLICKER_COSTS: Record<string, number> = {
  basic: 600,
  silver: 5000,
  gold: 30000,
  platinum: 150000,
  diamond: 750000,
};

// Starting money
export const STARTING_MONEY = 0;
