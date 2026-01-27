'use client';

import { motion } from 'framer-motion';
import { motionVariants } from '@/lib/motion/variants';

interface TokenLaunchSigilProps {
  onComplete?: () => void;
}

export function TokenLaunchSigil({ onComplete }: TokenLaunchSigilProps) {
  return (
    <motion.div
      variants={motionVariants.sigilReveal}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-50 bg-obsidian-base/90 backdrop-blur-sm flex items-center justify-center pointer-events-none"
    >
      <div className="text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-6"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-aureate-base">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.2" />
            <path 
              d="M50 20 L50 50 L70 70" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-aureate-base font-heading text-2xl mb-2"
        >
          The Seal Holds
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-mystic-steam-parchment/70 font-body text-sm"
        >
          Your token has been summoned
        </motion.p>
      </div>
    </motion.div>
  );
}
