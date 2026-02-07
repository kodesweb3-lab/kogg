import { useDataStream } from '@/contexts/DataStreamProvider';
import { useEffect } from 'react';
import { ExploreTab } from './types';
import { ExploreColumn } from './ExploreColumn';
import { cn } from '@/lib/utils';
import { MobileExploreTabs } from './MobileExploreTabs';
import { useExplore } from '@/contexts/ExploreProvider';
import { useBreakpoint } from '@/lib/device';
import { SearchBar } from './SearchBar';

type ExploreGridProps = {
  className?: string;
};

const ExploreGrid = ({ className }: ExploreGridProps) => {
  const { subscribeRecentTokenList, unsubscribeRecentTokenList } = useDataStream();
  const { mobileTab } = useExplore();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    subscribeRecentTokenList();
    return () => {
      unsubscribeRecentTokenList();
    };
  }, [subscribeRecentTokenList, unsubscribeRecentTokenList]);

  const isMobile = breakpoint === 'md' || breakpoint === 'sm' || breakpoint === 'xs';

  return (
    <div className={cn('flex flex-col', className)}>
      <SearchBar />
      
      <div
        className={cn(
          'grid grid-cols-1 border-[var(--border-default)] max-lg:grid-rows-[auto_1fr] lg:grid-cols-3 lg:border xl:overflow-hidden rounded-[var(--radius-lg)] flex-1'
        )}
      >
        <MobileExploreTabs />

        <div className="contents divide-x divide-[var(--border-default)]">
          <ExploreColumn tab={isMobile ? mobileTab : ExploreTab.NEW} />
          {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATING} />}
          {!isMobile && <ExploreColumn tab={ExploreTab.GRADUATED} />}
        </div>
      </div>
    </div>
  );
};

export default ExploreGrid;
