// Core game types

export interface CoinType {
  id: string;
  name: string;
  baseValue: number;
  baseCost: number;
  flipDuration: number; // in milliseconds
}

export interface CoinPosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

export interface Coin {
  id: string;
  typeId: string;
  isFlipping: boolean;
  position: CoinPosition;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  baseCost: number;
  level: number;
  maxLevel: number;
}

export interface GameState {
  money: number;
  coins: Coin[];
  upgrades: Upgrade[];
  autoClickers: Record<string, boolean>; // typeId -> purchased
}

export interface GameActions {
  flipCoin: (coinId: string) => void;
  completeCoinFlip: (coinId: string) => void;
  buyCoin: (typeId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  buyAutoClicker: (typeId: string) => void;
  toggleAutoClicker: (typeId: string) => void;
  getEarningsPerFlip: (typeId: string) => number;
  getCoinCost: (typeId: string) => number;
  getUpgradeCost: (upgradeId: string) => number;
  getAutoClickerCost: (typeId: string) => number;
  hasAutoClicker: (typeId: string) => boolean;
  isAutoClickerEnabled: (typeId: string) => boolean;
  addMoney: (amount: number) => void;
}

export type GameStore = GameState & GameActions;
