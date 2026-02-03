'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useState } from 'react';
import { SearchIcon, RocketIcon } from '@/components/icons/FeatureIcons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/Dialog';

const NAV_ITEMS = [
  { href: '/discover', label: 'Discover', Icon: SearchIcon },
  { href: '/create-pool', label: 'Launch', Icon: RocketIcon },
  { href: '/dashboard', label: 'Dashboard', Icon: DashboardIcon, requireWallet: true },
] as const;

const MORE_LINKS = [
  { href: '/service-providers', label: 'Marketplace' },
  { href: '/ide', label: 'IDE' },
  { href: '/playground/projects', label: 'Projects' },
  { href: '/for-agents', label: 'For Agents' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
  { href: '/wolves', label: 'Community' },
  { href: '/dev-log', label: 'Dev Log' },
  { href: '/lore', label: 'Lore' },
  { href: '/skill.md', label: 'Skill (API)', external: true },
];

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}

export function BottomNav() {
  const router = useRouter();
  const { connected } = useWallet();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--cyber-bg-elevated)]/95 backdrop-blur-xl border-t border-[var(--cyber-accent)]/20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-14 min-h-[56px] px-2">
          {NAV_ITEMS.map((item) => {
            if (item.requireWallet && !connected) return null;
            const Icon = item.Icon;
            const isActive =
              item.href === '/'
                ? router.pathname === '/'
                : router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[var(--button-min-height-touch)] rounded-lg transition-colors touch-manipulation active:scale-[0.98]"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-[var(--cyber-accent)]' : 'text-[var(--text-muted)]'}`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-[var(--cyber-accent)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[var(--button-min-height-touch)] rounded-lg transition-colors text-[var(--text-muted)] touch-manipulation active:scale-[0.98]"
            aria-label="More menu"
          >
            <MoreIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent
          className="z-[60] !left-0 !right-0 !top-auto !translate-x-0 !translate-y-0 max-w-sm mx-auto rounded-t-2xl rounded-b-none fixed bottom-0 left-0 right-0 p-0 pb-[env(safe-area-inset-bottom)] max-h-[70vh] overflow-hidden flex flex-col"
          animate={false}
        >
          <DialogTitle className="sr-only">More</DialogTitle>
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[var(--cyber-border-elevated)]">
            <span className="text-sm font-heading font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              More
            </span>
            <DialogCloseButton />
          </div>
          <div className="overflow-y-auto py-2">
            {MORE_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center min-h-[var(--button-min-height-touch)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--cyber-accent)]/10 border-l-2 border-transparent hover:border-[var(--cyber-accent)] touch-manipulation"
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center min-h-[var(--button-min-height-touch)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--cyber-accent)]/10 border-l-2 border-transparent hover:border-[var(--cyber-accent)] touch-manipulation"
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BottomNav;
