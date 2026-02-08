import plugin from 'tailwindcss/plugin';
import { addIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '390px',
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        xxs: ['0.5rem', { lineHeight: '0.625rem' }],
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        // Elevation shadows (premium, no glows)
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'elevation-2': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
        'elevation-4': '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
        // Subtle accent (used sparingly)
        'accent-subtle': '0 0 20px rgba(139, 92, 246, 0.08), 0 0 40px rgba(16, 185, 129, 0.04)',
        // Legacy aliases for compatibility
        'glow': '0 0 20px rgba(139, 92, 246, 0.08), 0 0 40px rgba(16, 185, 129, 0.04)',
        'glow-sm': '0 0 12px rgba(139, 92, 246, 0.06), 0 0 24px rgba(16, 185, 129, 0.03)',
        'glow-accent': '0 0 20px rgba(16, 185, 129, 0.1), 0 0 40px rgba(16, 185, 129, 0.05)',
        'cyber': '0 3px 6px rgba(0, 0, 0, 0.15)',
        'cyber-sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'cyber-inner': 'inset 0 1px 3px rgba(0, 0, 0, 0.12)',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      lineHeight: {
        tighter: '1.1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },

      colors: {
        // Semantic text colors
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        textSubtle: 'var(--text-secondary)',
        // Neutral scale (used by Explore components)
        neutral: {
          50: '#f0f2f5',
          100: '#e1e5eb',
          200: '#c3cad6',
          300: '#a1aab5',
          400: '#6e7681',
          500: '#484f58',
          600: '#30363d',
          700: '#21262d',
          750: '#1b2028',
          800: '#151b26',
          850: '#0d1117',
          900: '#0a0e14',
          925: '#07090f',
          950: '#040508',
        },
        // Primary green accent
        primary: {
          DEFAULT: '#14F195',
          200: '#3dffa8',
          300: '#14F195',
          400: '#0fc87a',
          500: '#0a9f61',
          600: '#077a4a',
          700: '#055534',
          800: '#033d25',
          900: '#022618',
          950: '#011a10',
        },
        // Amber (warnings, badges)
        amber: {
          50: '#fffbeb',
          100: '#fef3c6',
          200: '#fee685',
          300: '#ffd230',
          400: '#ffb900',
          DEFAULT: '#ffb900',
          500: '#fe9a00',
          600: '#e17100',
          700: '#bb4d00',
          800: '#973c00',
          900: '#7b3306',
          950: '#461901',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d0fae5',
          200: '#a4f4cf',
          300: '#5ee9b5',
          400: '#3ce3ab',
          DEFAULT: '#14F195',
          500: '#0fc87a',
          600: '#0a9f61',
          700: '#077a4a',
          800: '#055534',
          900: '#033d25',
          950: '#011a10',
        },
        rose: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#f85149',
          DEFAULT: '#f85149',
          500: '#da3633',
          600: '#b62324',
          700: '#8b1a1a',
          800: '#6b1d1d',
          900: '#4c1d1d',
          950: '#2d0f0f',
        },
      },
    },
  },
  plugins: [
    addIconSelectors({
      prefixes: ['ph'],
    }),
  ],
};
