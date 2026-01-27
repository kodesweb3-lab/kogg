import { Variants } from 'framer-motion';

export const motionVariants: Record<string, Variants> = {
  // Hover variants
  hoverLift: {
    scale: 1.02,
    y: -2,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  hoverGlow: {
    boxShadow: '0 0 20px var(--wolf-glow)',
    transition: { duration: 0.3 },
  },
  hoverScale: {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // Page transitions
  pageInitial: { 
    opacity: 0, 
    y: 20,
  },
  pageAnimate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  pageExit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
  
  // Signature moments
  sigilReveal: {
    hidden: {
      scale: 0,
      opacity: 0,
      rotate: 0,
    },
    visible: {
      scale: [0, 1.1, 1],
      opacity: [0, 1, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 0.7,
        ease: 'easeOut',
        times: [0, 0.6, 1],
      },
    },
  },
  
  // Fade in variants
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 },
    },
  },
  
  fadeInUp: {
    hidden: { 
      opacity: 0,
      y: 20,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  },
  
  // Scale in
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  },
  
  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
