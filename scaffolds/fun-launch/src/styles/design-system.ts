/**
 * Mystic Steampunk Ritual Design System
 * Inspired by the sacred mountain Kogaion, alchemy, ancient mechanisms, and rituals.
 * Premium, elegant, ritualistic design - no flashy effects.
 */

export const designSystem = {
  colors: {
    // Main colors
    charcoal: '#0E0F11', // Dark Charcoal - main background
    ash: '#16181D', // Deep Ash - cards/panels
    copper: '#B87333', // Antique Copper - primary accent
    bronze: '#8C5A2B', // Burnt Bronze - secondary accent
    oxidized: '#6F4E37', // Oxidized Copper - subtle accent
    parchment: '#E6E1D6', // Parchment Off-White - main text
    
    // Accents (very minimal use)
    umber: '#4A2E1F', // Blood Umber - warnings/danger
    gold: '#9C7A3C', // Muted Gold - status/highlights
  },
  
  fonts: {
    heading: ['Cinzel', 'Cormorant', 'Playfair Display SC', 'serif'],
    body: ['Inter', 'Source Serif 4', 'sans-serif'],
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  shadows: {
    // Subtle, almost invisible shadows
    subtle: '0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    // Copper accent shadow (very subtle)
    copper: '0 2px 4px rgba(184, 115, 51, 0.15)',
  },
  
  borders: {
    // Copper borders with opacity
    copper: {
      default: '1px solid rgba(184, 115, 51, 0.3)',
      medium: '1px solid rgba(184, 115, 51, 0.5)',
      strong: '1px solid rgba(184, 115, 51, 0.7)',
    },
    bronze: {
      default: '1px solid rgba(140, 90, 43, 0.3)',
      medium: '1px solid rgba(140, 90, 43, 0.5)',
    },
    oxidized: {
      default: '1px solid rgba(111, 78, 55, 0.3)',
    },
  },
  
  transitions: {
    // Slow, elegant transitions
    slow: 'all 0.5s ease-in-out',
    medium: 'all 0.3s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    // Specific transitions
    color: 'color 0.3s ease-in-out',
    background: 'background-color 0.3s ease-in-out',
    border: 'border-color 0.3s ease-in-out',
    transform: 'transform 0.3s ease-in-out',
  },
  
  effects: {
    // Film grain (subtle)
    filmGrain: {
      opacity: 0.03,
      size: '200px 200px',
    },
    // Vignette (discrete)
    vignette: {
      opacity: 0.15,
      size: '100% 100%',
    },
  },
  
  animations: {
    // Slow fade-in
    fadeIn: {
      duration: '0.8s',
      easing: 'ease-in-out',
    },
    // Micro-movement mechanical (1-2px)
    mechanicalShift: {
      duration: '0.2s',
      easing: 'ease-in-out',
      distance: '2px',
    },
  },
} as const;

// Type exports for TypeScript
export type DesignSystem = typeof designSystem;
export type ColorKey = keyof typeof designSystem.colors;
export type FontKey = keyof typeof designSystem.fonts;
export type SpacingKey = keyof typeof designSystem.spacing;
export type ShadowKey = keyof typeof designSystem.shadows;
export type BorderKey = keyof typeof designSystem.borders;
export type TransitionKey = keyof typeof designSystem.transitions;
