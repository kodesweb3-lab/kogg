import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

const CONFETTI_COLORS = [
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EF4444', // red
  '#EC4899', // pink
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: randomBetween(10, 90),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: randomBetween(0, 0.5),
        rotation: randomBetween(0, 360),
        scale: randomBetween(0.5, 1.5),
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: `${particle.x}vw`,
                y: -20,
                rotate: 0,
                scale: particle.scale,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation + 720,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: randomBetween(2, 4),
                delay: particle.delay,
                ease: 'linear',
              }}
              className="absolute"
              style={{
                width: 10,
                height: 10,
                backgroundColor: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default Confetti;
