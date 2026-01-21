'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SteamPuff {
  id: number;
  x: number; // percentage from left
  width: number; // base width in px
  height: number; // base height in px
  duration: number; // animation duration in seconds
  delay: number; // delay before starting
}

interface SteamEffectProps {
  intensity?: 'low' | 'medium' | 'high';
  enabled?: boolean;
}

export function SteamEffect({ intensity = 'medium', enabled = true }: SteamEffectProps) {
  const [puffs, setPuffs] = useState<SteamPuff[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Generate steam puffs based on intensity
    const puffCount = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 8;
    const newPuffs: SteamPuff[] = [];

    for (let i = 0; i < puffCount; i++) {
      newPuffs.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position
        width: 20 + Math.random() * 40, // 20-60px
        height: 60 + Math.random() * 80, // 60-140px
        duration: 12 + Math.random() * 8, // 12-20 seconds
        delay: Math.random() * 3, // 0-3 seconds delay
      });
    }

    setPuffs(newPuffs);

    // Regenerate puffs periodically for continuous effect
    const interval = setInterval(() => {
      setPuffs((prev) => {
        // Remove old puffs that have finished animating
        // Add new ones occasionally
        if (Math.random() > 0.7) {
          return [
            ...prev.slice(-puffCount + 1),
            {
              id: Date.now(),
              x: Math.random() * 100,
              width: 20 + Math.random() * 40,
              height: 60 + Math.random() * 80,
              duration: 12 + Math.random() * 8,
              delay: 0,
            },
          ];
        }
        return prev;
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [intensity, enabled]);

  if (!enabled || puffs.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {puffs.map((puff) => (
        <motion.div
          key={puff.id}
          className="absolute bottom-0"
          style={{
            left: `${puff.x}%`,
            width: `${puff.width}px`,
            height: `${puff.height}px`,
          }}
          initial={{
            y: 0,
            scale: 1,
            opacity: 0.6,
          }}
          animate={{
            y: '-100vh',
            scale: 2.5,
            opacity: [0.6, 0.4, 0.2, 0],
          }}
          transition={{
            duration: puff.duration,
            delay: puff.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 5 + Math.random() * 5,
          }}
        >
          <div
            className="w-full h-full rounded-full blur-xl"
            style={{
              background: `linear-gradient(to top, 
                rgba(255, 255, 255, 0.15) 0%, 
                rgba(200, 210, 220, 0.1) 30%, 
                rgba(150, 160, 170, 0.05) 60%, 
                transparent 100%)`,
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
