'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { GemsTokenListQueryArgs } from '@/components/Explore/queries';
import { ExploreTab } from '@/components/Explore/types';
import { TokenCardList } from '@/components/TokenCard/TokenCardList';
import { useLocalTokens } from '@/hooks/useLocalTokens';
import { transformDbTokenToPool } from '@/lib/tokenTransform';
import { EXPLORE_FIXED_TIMEFRAME, useExplore } from '@/contexts/ExploreProvider';
import { Pool } from '@/contexts/types';
import { isHoverableDevice, useBreakpoint } from '@/lib/device';
import { PausedIndicator } from './PausedIndicator';

type ExploreColumnProps = {
  tab: ExploreTab;
};

export const ExploreTabTitleMap: Record<ExploreTab, string> = {
  [ExploreTab.NEW]: `New`,
  [ExploreTab.GRADUATING]: `Soon`,
  [ExploreTab.GRADUATED]: `Bonded`,
};

export const ExploreColumn: React.FC<ExploreColumnProps> = ({ tab }) => {
  const { pausedTabs, setTabPaused, request } = useExplore();
  const isPaused = pausedTabs[tab];
  const setIsPaused = useCallback(
    (paused: boolean) => setTabPaused(tab, paused),
    [setTabPaused, tab]
  );

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-300px)]">
      {/* Desktop Column Header */}
      <div className="flex items-center justify-between p-3 max-lg:hidden">
        <div className="flex items-center gap-x-2">
          <h2 className="font-bold text-neutral-300">{ExploreTabTitleMap[tab]}</h2>
          {isPaused && <PausedIndicator />}
        </div>
      </div>

      {/* List */}
      <div className="relative flex-1 border-neutral-850 text-xs lg:border-t h-full">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2 bg-gradient-to-b from-neutral-950 to-transparent" />
        <TokenCardListContainer
          tab={tab}
          request={request}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </div>
    </div>
  );
};

type TokenCardListContainerProps = {
  tab: ExploreTab;
  request: Required<GemsTokenListQueryArgs>;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
};

const timeframe = EXPLORE_FIXED_TIMEFRAME;

const TokenCardListContainer: React.FC<TokenCardListContainerProps> = memo(
  ({ tab, request, isPaused, setIsPaused }) => {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'md' || breakpoint === 'sm' || breakpoint === 'xs';
    const { searchQuery, sortOption } = useExplore();

    const listRef = useRef<HTMLDivElement>(null);

    // Use local tokens from database (not global Solana)
    const { data: localTokensData, status: localStatus, error: localError } = useLocalTokens({
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      if (localTokensData) {
        console.log('[ExploreColumn] Tokens loaded:', localTokensData.data?.length || 0, 'tokens');
      }
      if (localError) {
        console.error('[ExploreColumn] Error loading tokens:', localError);
      }
    }

    // Transform DB tokens to Pool format
    let finalData = localTokensData?.data
      ? localTokensData.data.map(transformDbTokenToPool)
      : undefined;

    // Apply search filter
    if (finalData && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      finalData = finalData.filter(
        (pool) =>
          pool.baseAsset.name.toLowerCase().includes(query) ||
          pool.baseAsset.symbol.toLowerCase().includes(query) ||
          pool.baseAsset.id.toLowerCase().includes(query)
      );
    }

    // Apply sort
    if (finalData) {
      finalData = [...finalData].sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'mcap_high':
            return (b.baseAsset.mcap || 0) - (a.baseAsset.mcap || 0);
          case 'mcap_low':
            return (a.baseAsset.mcap || 0) - (b.baseAsset.mcap || 0);
          default:
            return 0;
        }
      });
    }

    const finalStatus = localStatus;

    const [snapshotData, setSnapshotData] = useState<Pool[]>();

    const handleMouseEnter = useCallback(() => {
      if (!isHoverableDevice() || finalStatus !== 'success') {
        return;
      }

      // When clicking elements (copyable) it triggers mouse enter again
      // We don't want to re-snapshot data if already paused
      if (!isPaused) {
        setSnapshotData(finalData);
      }
      setIsPaused(true);
    }, [finalData, isPaused, setIsPaused, finalStatus]);

    const handleMouseLeave = useCallback(() => {
      if (!isHoverableDevice()) return;

      setIsPaused(false);
    }, [setIsPaused]);

    // Note: Removed stream mutation logic since we're using local DB tokens
    // If you need real-time updates, consider implementing WebSocket updates for DB tokens

    const handleScroll = useCallback(() => {
      if (!isMobile || !listRef.current) return;

      const top = listRef.current.getBoundingClientRect().top;

      if (top <= 0) {
        // Only snapshot on initial pause
        if (!isPaused) {
          setSnapshotData(finalData);
        }
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }, [finalData, isPaused, setIsPaused, isMobile]);

    // Handle scroll pausing on mobile
    useEffect(() => {
      if (!isMobile) return;

      // Initial check
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        setIsPaused(false);
      };
    }, [isMobile, setIsPaused, handleScroll]);

    // Map snapshot data to current data for most recent updated data
    const displayData = isPaused
      ? snapshotData?.map((snapshotPool) => {
          const current = finalData?.find(
            (p) => p.baseAsset.id === snapshotPool.baseAsset.id
          );
          if (current) {
            return current;
          }
          return snapshotPool;
        })
      : finalData;

    return (
      <TokenCardList
        ref={listRef}
        data={displayData}
          status={finalStatus}
        timeframe={timeframe}
        trackPools
        className="lg:h-0 lg:min-h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }
);

TokenCardListContainer.displayName = 'TokenCardListContainer';
