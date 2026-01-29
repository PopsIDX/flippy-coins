import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { COIN_TYPES } from '../utils/constants';
import { formatMoney } from '../utils/calculations';
import type { Coin as CoinType } from '../types/game';
import { FloatingText } from './FloatingText';
import type { FloatingTextRef } from './FloatingText';
import gsap from 'gsap';
import './Coin.css';

interface CoinProps {
  coin: CoinType;
}

// Generate random offset for launch effect (bigger range for chaos)
const generateLaunchOffset = () => ({
  x: (Math.random() - 0.5) * 60,
  y: -40 - Math.random() * 40, // Always go up, more variation
});

// Generate random number of flips (1-3 whole rotations so it lands face-up)
const generateFlipCount = () => 1 + Math.floor(Math.random() * 3);

// Generate random speed multiplier (0.8 to 1.2 for more variation)
const generateSpeedMultiplier = () => 0.8 + Math.random() * 0.4;

// Generate random settle offset with boundary checking
const generateBoundedSettleOffset = (
  coinElement: HTMLDivElement,
  maxOffset: number = 60
) => {
  const parent = coinElement.parentElement;
  if (!parent) {
    return { x: (Math.random() - 0.5) * maxOffset * 2, y: (Math.random() - 0.5) * maxOffset * 2 };
  }
  
  const parentRect = parent.getBoundingClientRect();
  const coinRect = coinElement.getBoundingClientRect();
  
  // Current position relative to parent center
  const coinCenterX = coinRect.left + coinRect.width / 2 - parentRect.left;
  const coinCenterY = coinRect.top + coinRect.height / 2 - parentRect.top;
  
  // Safe margins (coin radius + padding)
  const margin = 50;
  
  // Calculate max offsets to stay within bounds
  const maxLeftOffset = -(coinCenterX - margin);
  const maxRightOffset = parentRect.width - coinCenterX - margin;
  const maxTopOffset = -(coinCenterY - margin);
  const maxBottomOffset = parentRect.height - coinCenterY - margin;
  
  // Generate random offset and clamp to bounds
  let offsetX = (Math.random() - 0.5) * maxOffset * 2;
  let offsetY = (Math.random() - 0.5) * maxOffset * 2;
  
  offsetX = Math.max(maxLeftOffset, Math.min(maxRightOffset, offsetX));
  offsetY = Math.max(maxTopOffset, Math.min(maxBottomOffset, offsetY));
  
  return { x: offsetX, y: offsetY };
};

// Generate random wobble (tilt during flight)
const generateWobble = () => ({
  rotateX: (Math.random() - 0.5) * 30,
  rotateZ: (Math.random() - 0.5) * 25,
});

export function Coin({ coin }: CoinProps) {
  const { flipCoin, completeCoinFlip, getEarningsPerFlip, isAutoClickerEnabled } = useGameStore();
  const coinTypeData = COIN_TYPES[coin.typeId];
  const coinRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const floatingTextRef = useRef<FloatingTextRef>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  
  // Get earnings for this coin type
  const earnings = getEarningsPerFlip(coin.typeId);

  // Check if auto-clicker is enabled for this coin type
  const isAutoClickEnabled = isAutoClickerEnabled(coin.typeId);

  const handleClick = useCallback((isAutoTrigger: boolean = false) => {
    // Block manual clicks if auto-clicker is enabled
    if (!isAutoTrigger && isAutoClickEnabled) return;
    if (coin.isFlipping || !coinRef.current || !innerRef.current || !coinTypeData) return;
    
    // Generate random values for this flip
    const offset = generateLaunchOffset();
    const flipCount = generateFlipCount();
    const speedMultiplier = generateSpeedMultiplier();
    const settleOffset = generateBoundedSettleOffset(coinRef.current);
    const wobble = generateWobble();
    const duration = (coinTypeData.flipDuration / 1000) * speedMultiplier;
    
    // Start the flip in state
    flipCoin(coin.id);
    
    // Kill any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    // Create GSAP timeline for smooth animation
    const tl = gsap.timeline({
      onStart: () => {
        // Bring coin to front while animating
        if (coinRef.current) {
          gsap.set(coinRef.current, { zIndex: 100 });
        }
      },
      onComplete: () => {
        // Reset z-index and rotations
        if (coinRef.current) {
          gsap.set(coinRef.current, { zIndex: 1 });
        }
        if (innerRef.current) {
          gsap.set(innerRef.current, { rotateY: 0, rotateX: 0 });
        }
        // Show floating text and complete flip
        floatingTextRef.current?.show();
        completeCoinFlip(coin.id);
      },
    });
    
    timelineRef.current = tl;
    
    const peakTime = duration * 0.35; // Time to reach peak
    const fallTime = duration * 0.65; // Time to fall back
    
    // Phase 1: Launch up with wobble (fast start, slow at peak)
    tl.to(coinRef.current, {
      x: offset.x,
      y: offset.y,
      scale: 1.1,
      rotateZ: wobble.rotateZ,
      duration: peakTime,
      ease: 'power2.out',
    }, 0);
    
    // Phase 2: Fall down directly to settle position
    tl.to(coinRef.current, {
      x: settleOffset.x,
      y: settleOffset.y,
      scale: 1,
      rotateZ: 0,
      duration: fallTime,
      ease: 'bounce.out',
    }, peakTime);
    
    // Main flip rotation (Y-axis)
    tl.to(innerRef.current, {
      rotateY: flipCount * 360,
      duration: duration,
      ease: 'power2.out',
    }, 0);
    
    // Add wobble tilt during flight (X-axis)
    tl.to(innerRef.current, {
      rotateX: wobble.rotateX,
      duration: peakTime,
      ease: 'power2.out',
    }, 0);
    
    // Settle the X tilt back to 0
    tl.to(innerRef.current, {
      rotateX: 0,
      duration: fallTime,
      ease: 'bounce.out',
    }, peakTime);
    
  }, [coin.id, coin.isFlipping, coinTypeData, flipCoin, completeCoinFlip, isAutoClickEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // Auto-click functionality
  const handleClickRef = useRef(handleClick);
  
  useEffect(() => {
    handleClickRef.current = handleClick;
  }, [handleClick]);

  useEffect(() => {
    if (!isAutoClickEnabled || !coinTypeData) return;

    // Base interval + random variation (±15%) for natural feel
    const baseInterval = coinTypeData.flipDuration + 200;
    const getRandomInterval = () => baseInterval + (Math.random() - 0.5) * baseInterval * 0.3;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const scheduleNextClick = () => {
      timeoutId = setTimeout(() => {
        handleClickRef.current(true); // true = auto-triggered
        scheduleNextClick();
      }, getRandomInterval());
    };

    // Random initial delay (0-500ms) so coins don't start together
    const initialDelay = Math.random() * 500;
    timeoutId = setTimeout(() => {
      handleClickRef.current(true); // true = auto-triggered
      scheduleNextClick();
    }, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [isAutoClickEnabled, coinTypeData]);

  if (!coinTypeData) return null;

  return (
    <div
      ref={coinRef}
      className={`coin coin-type-${coin.typeId}${isAutoClickEnabled ? ' auto-flipping' : ''}`}
      onClick={() => handleClick(false)}
      style={{
        left: `${coin.position.x}%`,
        top: `${coin.position.y}%`,
        cursor: isAutoClickEnabled ? 'default' : 'pointer',
        pointerEvents: isAutoClickEnabled ? 'none' : 'auto',
      }}
      role="button"
      tabIndex={isAutoClickEnabled ? -1 : 0}
      aria-label={`${coinTypeData.name}${isAutoClickEnabled ? ' (auto-flipping)' : coin.isFlipping ? ' (flipping)' : ' - click to flip'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(false);
        }
      }}
    >
      <div ref={innerRef} className="coin-inner">
        <div className="coin-face coin-front">
          <span className="coin-value">{coinTypeData.baseValue}</span>
          <div className="coin-shine" />
        </div>
        <div className="coin-face coin-back">
          <span className="coin-value">{coinTypeData.baseValue}</span>
          <div className="coin-shine" />
        </div>
      </div>
      <FloatingText ref={floatingTextRef} text={`+${formatMoney(earnings)}`} variant="gain" />
    </div>
  );
}
