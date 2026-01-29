import type { Upgrade } from '../types/game';
import {
  COIN_TYPES,
  COIN_COST_MULTIPLIER,
  UPGRADE_COST_MULTIPLIER,
} from './constants';

/**
 * Calculate the cost of the next coin of a given type
 * Formula: baseCost * multiplier^owned
 */
export function calculateCoinCost(typeId: string, ownedCount: number): number {
  const coinType = COIN_TYPES[typeId];
  if (!coinType) return Infinity;
  
  return Math.floor(coinType.baseCost * Math.pow(COIN_COST_MULTIPLIER, ownedCount));
}

/**
 * Calculate earnings per flip for a coin type, considering upgrades
 * Formula: baseValue * (1 + sum(upgrade.multiplier * upgrade.level))
 */
export function calculateEarningsPerFlip(
  typeId: string,
  upgrades: Upgrade[]
): number {
  const coinType = COIN_TYPES[typeId];
  if (!coinType) return 0;

  const totalMultiplier = upgrades.reduce((sum, upgrade) => {
    return sum + upgrade.multiplier * upgrade.level;
  }, 0);

  return Math.floor(coinType.baseValue * (1 + totalMultiplier));
}

/**
 * Calculate the cost of the next upgrade level
 * Formula: baseCost * multiplier^level
 */
export function calculateUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(
    upgrade.baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, upgrade.level)
  );
}

/**
 * Format money for display (e.g., 1500 -> "1.5K")
 */
export function formatMoney(amount: number): string {
  if (amount < 1000) return `$${amount}`;
  if (amount < 1_000_000) return `$${(amount / 1000).toFixed(1)}K`;
  if (amount < 1_000_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  return `$${(amount / 1_000_000_000).toFixed(1)}B`;
}
