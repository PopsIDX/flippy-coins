import { create } from 'zustand';
import type { GameStore, Coin } from '../types/game';
import { INITIAL_UPGRADES, STARTING_MONEY, COIN_TYPES, AUTO_CLICKER_COSTS } from '../utils/constants';
import {
  calculateCoinCost,
  calculateEarningsPerFlip,
  calculateUpgradeCost,
} from '../utils/calculations';

// Generate unique IDs
let coinIdCounter = 1;
const generateCoinId = () => `coin_${++coinIdCounter}`;

// Generate random position within safe bounds (avoiding edges)
const generateRandomPosition = () => ({
  x: 5 + Math.random() * 80, // 5-85% to keep coin visible
  y: 5 + Math.random() * 80,
});

// Initial coin
const INITIAL_COINS: Coin[] = [
  { id: 'coin_1', typeId: 'basic', isFlipping: false, position: generateRandomPosition() },
];

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  money: STARTING_MONEY,
  coins: INITIAL_COINS,
  upgrades: [...INITIAL_UPGRADES],
  autoClickers: {},

  // Actions
  flipCoin: (coinId: string) => {
    set((state) => ({
      coins: state.coins.map((coin) =>
        coin.id === coinId ? { ...coin, isFlipping: true } : coin
      ),
    }));
  },

  completeCoinFlip: (coinId: string) => {
    const state = get();
    const coin = state.coins.find((c) => c.id === coinId);
    if (!coin) return;

    const earnings = calculateEarningsPerFlip(coin.typeId, state.upgrades);

    set((state) => ({
      money: state.money + earnings,
      coins: state.coins.map((c) =>
        c.id === coinId ? { ...c, isFlipping: false } : c
      ),
    }));
  },

  buyCoin: (typeId: string) => {
    const state = get();
    const ownedCount = state.coins.filter((c) => c.typeId === typeId).length;
    const cost = calculateCoinCost(typeId, ownedCount);

    if (state.money < cost) return;
    if (!COIN_TYPES[typeId]) return;

    const newCoin: Coin = {
      id: generateCoinId(),
      typeId,
      isFlipping: false,
      position: generateRandomPosition(),
    };

    set((state) => ({
      money: state.money - cost,
      coins: [...state.coins, newCoin],
    }));
  },

  buyUpgrade: (upgradeId: string) => {
    const state = get();
    const upgrade = state.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return;
    if (upgrade.level >= upgrade.maxLevel) return;

    const cost = calculateUpgradeCost(upgrade);
    if (state.money < cost) return;

    set((state) => ({
      money: state.money - cost,
      upgrades: state.upgrades.map((u) =>
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      ),
    }));
  },

  buyAutoClicker: (typeId: string) => {
    const state = get();
    if (typeId in state.autoClickers) return; // Already purchased
    if (!COIN_TYPES[typeId]) return;

    const cost = AUTO_CLICKER_COSTS[typeId] ?? Infinity;
    if (state.money < cost) return;

    set((state) => ({
      money: state.money - cost,
      autoClickers: { ...state.autoClickers, [typeId]: true }, // enabled by default
    }));
  },

  toggleAutoClicker: (typeId: string) => {
    const state = get();
    if (!(typeId in state.autoClickers)) return; // Not purchased
    
    set((state) => ({
      autoClickers: { ...state.autoClickers, [typeId]: !state.autoClickers[typeId] },
    }));
  },

  // Getters (computed values)
  getEarningsPerFlip: (typeId: string) => {
    const state = get();
    return calculateEarningsPerFlip(typeId, state.upgrades);
  },

  getCoinCost: (typeId: string) => {
    const state = get();
    const ownedCount = state.coins.filter((c) => c.typeId === typeId).length;
    return calculateCoinCost(typeId, ownedCount);
  },

  getUpgradeCost: (upgradeId: string) => {
    const state = get();
    const upgrade = state.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return Infinity;
    return calculateUpgradeCost(upgrade);
  },

  getAutoClickerCost: (typeId: string) => {
    return AUTO_CLICKER_COSTS[typeId] ?? Infinity;
  },

  hasAutoClicker: (typeId: string) => {
    const state = get();
    return typeId in state.autoClickers;
  },

  isAutoClickerEnabled: (typeId: string) => {
    const state = get();
    return state.autoClickers[typeId] ?? false;
  },

  // Cheat: add money
  addMoney: (amount: number) => {
    set((state) => ({ money: state.money + amount }));
  },
}));
