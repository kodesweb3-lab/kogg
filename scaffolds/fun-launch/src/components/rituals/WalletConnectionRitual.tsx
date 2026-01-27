'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { motionVariants } from '@/lib/motion/variants';

interface WalletConnectionRitualProps {
  isConnecting: boolean;
  onComplete?: () => void;
}

export function WalletConnectionRitual({ isConnecting, onComplete }: WalletConnectionRitualProps) {
  return (
    <AnimatePresence>
      {isConnecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-obsidian-base/95 backdrop-blur-sm flex items-center justify-center"
          onAnimationComplete={onComplete}
        >
          <motion.div
            variants={motionVariants.sigilReveal}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto border-2 border-aureate-base rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-aureate-base border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-aureate-base font-heading text-xl">Entering Kogaion...</p>
            <p className="text-mystic-steam-parchment/60 font-body text-sm mt-2">
              The chain awaits your connection
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
