import { useEffect, useRef } from 'react';
import { formatMoney } from '../utils/calculations';
import gsap from 'gsap';
import './MoneyDisplay.css';

interface MoneyDisplayProps {
  money: number;
}

export function MoneyDisplay({ money }: MoneyDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const prevMoneyRef = useRef(money);
  const animationIntensityRef = useRef(0);
  
  useEffect(() => {
    if (!containerRef.current || !textRef.current || !glowRef.current) return;
    
    const moneyDiff = money - prevMoneyRef.current;
    prevMoneyRef.current = money;
    
    // Only animate on money increase
    if (moneyDiff <= 0) return;
    
    // Increase intensity for rapid clicks (stacks up to 5x)
    animationIntensityRef.current = Math.min(animationIntensityRef.current + 1, 5);
    const intensity = animationIntensityRef.current;
    
    // Kill existing animations
    gsap.killTweensOf([containerRef.current, textRef.current, glowRef.current]);
    
    // Snappy scale pop based on intensity
    const scaleAmount = 1 + (0.05 * intensity);
    gsap.fromTo(containerRef.current,
      { scale: scaleAmount + 0.1 },
      { 
        scale: 1, 
        duration: 0.3, 
        ease: 'elastic.out(1, 0.5)',
      }
    );
    
    // Text color flash
    gsap.fromTo(textRef.current,
      { 
        color: '#ffffff',
        textShadow: `0 0 ${20 + intensity * 10}px rgba(255, 255, 255, 0.8), 0 0 ${40 + intensity * 15}px rgba(212, 175, 55, 1)`,
      },
      { 
        color: '#d4af37',
        textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
        duration: 0.4,
        ease: 'power2.out',
      }
    );
    
    // Glow pulse
    gsap.fromTo(glowRef.current,
      { 
        opacity: 0.3 + (intensity * 0.15),
        scale: 1.5 + (intensity * 0.2),
      },
      { 
        opacity: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      }
    );
    
    // Decay intensity over time
    const decayTimeout = setTimeout(() => {
      animationIntensityRef.current = Math.max(0, animationIntensityRef.current - 1);
    }, 300);
    
    return () => clearTimeout(decayTimeout);
  }, [money]);
  
  return (
    <div ref={containerRef} className="money-display">
      <div ref={glowRef} className="money-glow" />
      <span ref={textRef} className="money-text">{formatMoney(money)}</span>
    </div>
  );
}
