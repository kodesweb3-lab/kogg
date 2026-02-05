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

const MORE_GROUPS: { label: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    label: 'Product',
    links: [
      { href: '/service-providers', label: 'Marketplace' },
    ],
  },
  {
    label: 'Build',
    links: [
      { href: '/ide', label: 'IDE' },
      { href: '/playground/projects', label: 'Projects' },
      { href: '/for-agents', label: 'For Agents' },
      { href: '/agents-playground', label: 'Agents Playground' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '/about', label: 'About' },
      { href: '/wolves', label: 'Community' },
      { href: '/dev-log', label: 'Dev Log' },
      { href: '/lore', label: 'Lore' },
      { href: '/skill.md', label: 'Skill (API)', external: true },
    ],
  },
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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around gap-1 px-2 pt-3 pb-[env(safe-area-inset-bottom)] min-h-[64px]"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
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
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[72px] min-h-[52px] rounded-2xl transition-all touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
                isActive ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
              {isActive && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-1 min-w-[72px] min-h-[52px] rounded-2xl text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all touch-manipulation active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="More menu"
        >
          <MoreIcon className="w-6 h-6" />
          <span className="text-[11px] font-medium">More</span>
        </button>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent
          className="z-[60] !left-0 !right-0 !top-auto !translate-x-0 !translate-y-0 max-w-sm mx-auto rounded-t-3xl rounded-b-none fixed bottom-0 left-0 right-0 p-0 pb-[env(safe-area-inset-bottom)] max-h-[75vh] overflow-hidden flex flex-col border-0"
          style={{ background: 'var(--bg-elevated)' }}
          animate={false}
        >
          <DialogTitle className="sr-only">More</DialogTitle>
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border-default)]">
            <span className="text-base font-semibold text-[var(--text-primary)]">Menu</span>
            <DialogCloseButton />
          </div>
          <div className="overflow-y-auto py-4 px-3 space-y-6">
            {MORE_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-3">
                  {group.label}
                </div>
                <div className="rounded-xl bg-[var(--bg-layer)] p-1 space-y-0.5">
                  {group.links.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center min-h-12 px-4 rounded-lg text-[var(--text-primary)] font-medium hover:bg-[var(--accent)]/10"
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                          router.pathname === link.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                        }`}
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BottomNav;
