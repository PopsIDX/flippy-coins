import { useRef, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import './FloatingText.css';

export interface FloatingTextRef {
  show: () => void;
}

interface FloatingTextProps {
  text: string;
  variant?: 'gain' | 'spend';
}

export const FloatingText = forwardRef<FloatingTextRef, FloatingTextProps>(
  ({ text, variant = 'gain' }, ref) => {
    const floatingTextRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      show: () => {
        if (!floatingTextRef.current) return;

        const el = floatingTextRef.current;
        const randomX = (Math.random() - 0.5) * 30;

        // Kill any existing animation on this element
        gsap.killTweensOf(el);

        // Reset and animate
        gsap.set(el, {
          opacity: 0,
          y: 0,
          x: randomX,
          scale: 0.5,
          rotation: (Math.random() - 0.5) * 10,
        });

        // Snappy pop-up animation
        gsap.to(el, {
          opacity: 1,
          y: -20,
          scale: 1.2,
          duration: 0.15,
          ease: 'back.out(3)',
        });

        // Float up and fade out
        gsap.to(el, {
          y: -60,
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          delay: 0.15,
          ease: 'power2.out',
        });
      },
    }));

    return (
      <div
        ref={floatingTextRef}
        className={`floating-text floating-text--${variant}`}
      >
        {text}
      </div>
    );
  }
);

FloatingText.displayName = 'FloatingText';
