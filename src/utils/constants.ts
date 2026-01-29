import type { CoinType, Upgrade } from '../types/game';

// Coin type definitions
export const COIN_TYPES: Record<string, CoinType> = {
  basic: {
    id: 'basic',
    name: 'Bronze Coin',
    baseValue: 1,
    baseCost: 5,
    flipDuration: 1200,
  },
  silver: {
    id: 'silver',
    name: 'Silver Coin',
    baseValue: 5,
    baseCost: 35,
    flipDuration: 1100,
  },
  gold: {
    id: 'gold',
    name: 'Gold Coin',
    baseValue: 25,
    baseCost: 200,
    flipDuration: 1000,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Coin',
    baseValue: 100,
    baseCost: 1000,
    flipDuration: 900,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Coin',
    baseValue: 400,
    baseCost: 5000,
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
    baseCost: 15,
    level: 0,
    maxLevel: 10,
  },
];

// Cost scaling factors
export const COIN_COST_MULTIPLIER = 1.12;
export const UPGRADE_COST_MULTIPLIER = 1.4;

// Auto-clicker costs (one-time purchase per coin type)
export const AUTO_CLICKER_COSTS: Record<string, number> = {
  basic: 100,
  silver: 800,
  gold: 5000,
  platinum: 25000,
  diamond: 125000,
};

// Starting money
export const STARTING_MONEY = 0;
