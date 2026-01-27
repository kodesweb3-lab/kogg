'use client';

import { motion } from 'framer-motion';
import { motionVariants } from '@/lib/motion/variants';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="pageInitial"
      animate="pageAnimate"
      exit="pageExit"
      variants={motionVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
