'use client';

import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'kogaion-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(WATCHLIST_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      } catch (error) {
        console.error('[useWatchlist] Error reading watchlist:', error);
      }
    }
  }, []);

  const addToWatchlist = useCallback((mint: string) => {
    if (!mounted) return;
    setWatchlist((prev) => {
      if (prev.includes(mint)) return prev;
      const updated = [...prev, mint];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('[useWatchlist] Error saving watchlist:', error);
        }
      }
      return updated;
    });
  }, [mounted]);

  const removeFromWatchlist = useCallback((mint: string) => {
    if (!mounted) return;
    setWatchlist((prev) => {
      const updated = prev.filter((m) => m !== mint);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('[useWatchlist] Error saving watchlist:', error);
        }
      }
      return updated;
    });
  }, [mounted]);

  const isInWatchlist = useCallback((mint: string) => {
    return watchlist.includes(mint);
  }, [watchlist]);

  const toggleWatchlist = useCallback((mint: string) => {
    if (isInWatchlist(mint)) {
      removeFromWatchlist(mint);
    } else {
      addToWatchlist(mint);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    mounted,
  };
}
