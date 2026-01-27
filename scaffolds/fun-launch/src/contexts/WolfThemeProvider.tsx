'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from 'react';

// SSR-safe localStorage hook that prevents hydration mismatches
function useSSRSafeLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  // Only access localStorage after component mounts (client-side)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.error(`[WolfThemeProvider] Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        if (typeof window !== 'undefined' && mounted) {
          if (value === null || value === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        }
      } catch (error) {
        console.error(`[WolfThemeProvider] Error setting localStorage key "${key}":`, error);
      }
    },
    [key, mounted]
  );

  // Return initialValue during SSR, storedValue after mount
  return [mounted ? storedValue : initialValue, setValue];
}

export type WolfTheme = 'fire' | 'frost' | 'blood' | 'moon' | 'stone' | null;

interface WolfThemeConfig {
  accent: string;
  glow: string;
  bgTint: string;
  border: string;
  iconStyle: string;
  microcopyTone: 'aggressive' | 'calm' | 'dark' | 'hopeful' | 'stable';
}

interface WolfThemeContextType {
  selectedWolf: WolfTheme;
  setSelectedWolf: (wolf: WolfTheme) => void;
  themeConfig: WolfThemeConfig;
}

const WOLF_THEME_CONFIGS: Record<NonNullable<WolfTheme>, WolfThemeConfig> = {
  fire: {
    accent: 'var(--wolf-fire-accent)',
    glow: 'var(--wolf-fire-glow)',
    bgTint: 'var(--wolf-fire-bg-tint)',
    border: 'var(--wolf-fire-border)',
    iconStyle: 'fire',
    microcopyTone: 'aggressive',
  },
  frost: {
    accent: 'var(--wolf-frost-accent)',
    glow: 'var(--wolf-frost-glow)',
    bgTint: 'var(--wolf-frost-bg-tint)',
    border: 'var(--wolf-frost-border)',
    iconStyle: 'frost',
    microcopyTone: 'calm',
  },
  blood: {
    accent: 'var(--wolf-blood-accent)',
    glow: 'var(--wolf-blood-glow)',
    bgTint: 'var(--wolf-blood-bg-tint)',
    border: 'var(--wolf-blood-border)',
    iconStyle: 'blood',
    microcopyTone: 'dark',
  },
  moon: {
    accent: 'var(--wolf-moon-accent)',
    glow: 'var(--wolf-moon-glow)',
    bgTint: 'var(--wolf-moon-bg-tint)',
    border: 'var(--wolf-moon-border)',
    iconStyle: 'moon',
    microcopyTone: 'hopeful',
  },
  stone: {
    accent: 'var(--wolf-stone-accent)',
    glow: 'var(--wolf-stone-glow)',
    bgTint: 'var(--wolf-stone-bg-tint)',
    border: 'var(--wolf-stone-border)',
    iconStyle: 'stone',
    microcopyTone: 'stable',
  },
};

const defaultTheme: WolfThemeConfig = {
  accent: 'var(--aureate-base)',
  glow: 'var(--aureate-glow)',
  bgTint: 'rgba(184, 160, 130, 0.05)',
  border: 'rgba(184, 160, 130, 0.3)',
  iconStyle: 'default',
  microcopyTone: 'stable',
};

const WolfThemeContext = createContext<WolfThemeContextType | undefined>(undefined);

export function WolfThemeProvider({ children }: { children: ReactNode }) {
  // Use SSR-safe localStorage hook
  const [selectedWolf, setSelectedWolfState] = useSSRSafeLocalStorage<WolfTheme>(
    'kogaion-wolf-theme',
    null
  );
  
  // Track mounted state separately for DOM operations
  const [mounted, setMounted] = useState(false);

  // Set mounted flag on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  const setSelectedWolf = (wolf: WolfTheme) => {
    setSelectedWolfState(wolf);
    // Update data attribute on document root for CSS
    if (typeof document !== 'undefined' && mounted) {
      document.documentElement.setAttribute('data-wolf-theme', wolf || 'default');
    }
  };

  // Initialize data attribute on mount and when theme changes (client-side only)
  useEffect(() => {
    if (typeof document !== 'undefined' && mounted) {
      const theme = selectedWolf || 'default';
      document.documentElement.setAttribute('data-wolf-theme', theme);
    }
  }, [selectedWolf, mounted]);
  
  // Initialize on mount (client-side only)
  useEffect(() => {
    if (typeof document !== 'undefined' && mounted) {
      if (!document.documentElement.hasAttribute('data-wolf-theme')) {
        document.documentElement.setAttribute('data-wolf-theme', selectedWolf || 'default');
      }
    }
  }, [mounted, selectedWolf]);

  const themeConfig = useMemo(() => {
    if (!selectedWolf) return defaultTheme;
    return WOLF_THEME_CONFIGS[selectedWolf];
  }, [selectedWolf]);

  return (
    <WolfThemeContext.Provider value={{ selectedWolf, setSelectedWolf, themeConfig }}>
      {children}
    </WolfThemeContext.Provider>
  );
}

export function useWolfTheme() {
  const context = useContext(WolfThemeContext);
  if (context === undefined) {
    throw new Error('useWolfTheme must be used within a WolfThemeProvider');
  }
  return context;
}
