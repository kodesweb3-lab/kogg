import React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { useExplore } from '@/contexts/ExploreProvider';
import { ExploreTab } from './types';
import { PausedIndicator } from './PausedIndicator';
import { cn } from '@/lib/utils';

export const ExploreTabTitleMap: Record<ExploreTab, string> = {
  [ExploreTab.NEW]: `New`,
  [ExploreTab.GRADUATING]: `Soon`,
  [ExploreTab.GRADUATED]: `Bonded`,
};

export const MobileExploreTabs = () => {
  const { mobileTab, setMobileTab, pausedTabs } = useExplore();
  return (
    <div className="sticky inset-x-0 top-0 z-20 border-b border-[var(--border-default)] shadow-md shadow-[var(--bg-base)] lg:hidden bg-[var(--bg-layer)]">
      <div className="px-2 py-2">
        <ToggleGroupPrimitive.Root
          className="flex min-h-[var(--button-min-height-touch)] w-full min-w-fit items-center gap-1 text-sm"
          type="single"
          value={mobileTab}
          onValueChange={(value) => {
            if (value) {
              setMobileTab(value as ExploreTab);
            }
          }}
        >
          <ToggleGroupItem value={ExploreTab.NEW}>
            {ExploreTabTitleMap[ExploreTab.NEW]}
            {mobileTab === ExploreTab.NEW && pausedTabs[ExploreTab.NEW] && <PausedIndicator />}
          </ToggleGroupItem>
          <ToggleGroupItem value={ExploreTab.GRADUATING}>
            {ExploreTabTitleMap[ExploreTab.GRADUATING]}
            {mobileTab === ExploreTab.GRADUATING && pausedTabs[ExploreTab.GRADUATING] && (
              <PausedIndicator />
            )}
          </ToggleGroupItem>
          <ToggleGroupItem value={ExploreTab.GRADUATED}>
            {ExploreTabTitleMap[ExploreTab.GRADUATED]}
            {mobileTab === ExploreTab.GRADUATED && pausedTabs[ExploreTab.GRADUATED] && (
              <PausedIndicator />
            )}
          </ToggleGroupItem>
        </ToggleGroupPrimitive.Root>
      </div>
    </div>
  );
};

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex h-full w-full items-center justify-center gap-1 whitespace-nowrap rounded-[var(--radius-sm)] px-3 text-[var(--text-muted)] transition-all',
        'data-[state=off]:hover:text-[var(--text-secondary)]',
        'data-[state=on]:text-[var(--accent)] data-[state=on]:after:absolute data-[state=on]:after:bottom-0 data-[state=on]:after:left-2 data-[state=on]:after:right-2 data-[state=on]:after:h-[2px] data-[state=on]:after:bg-gradient-to-r data-[state=on]:after:from-[var(--accent-purple)] data-[state=on]:after:to-[var(--accent)]',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(20,241,149,0.15)]',
        className
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
