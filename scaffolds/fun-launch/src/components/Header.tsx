'use client';

import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo, useState, useEffect, useRef } from 'react';
import { shortenAddress } from '@/lib/utils';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const ReferralModal = dynamic(() => import('./ReferralModal'), { ssr: false });

type NavItem = { label: string; href: string; description?: string; external?: boolean };

const moreNav: NavItem[] = [
  { label: 'IDE', href: '/ide', description: 'In-browser code editor' },
  { label: 'Projects', href: '/playground/projects', description: 'Contest projects & votes' },
  { label: 'For Agents', href: '/for-agents', description: 'API docs & agent hub' },
  { label: 'Agents Playground', href: '/agents-playground', description: 'Chat & share ideas with agents' },
  { label: 'Leaderboard', href: '/leaderboard', description: 'Top creators' },
  { label: 'About', href: '/about', description: 'What is Kogaion, fees, security, FAQ' },
  { label: 'Community', href: '/wolves', description: 'Telegram, X (Twitter)' },
  { label: 'Dev Log', href: '/dev-log', description: 'Updates & changelog' },
  { label: 'Lore', href: '/lore', description: 'Brand & story' },
  { label: 'Skill (API)', href: '/skill.md', description: 'Full API reference', external: true },
];

const productNav: NavItem[] = [
  { label: 'Discover', href: '/discover' },
  { label: 'Launch', href: '/create-pool' },
  { label: 'Marketplace', href: '/service-providers' },
];

const buildNav: NavItem[] = [
  { label: 'IDE', href: '/ide' },
  { label: 'Projects', href: '/playground/projects' },
  { label: 'For Agents', href: '/for-agents' },
  { label: 'Agents Playground', href: '/agents-playground' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

const communityNav: NavItem[] = [{ label: 'Community', href: '/wolves' }];

const resourcesNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Dev Log', href: '/dev-log' },
  { label: 'Lore', href: '/lore' },
  { label: 'Skill (API)', href: '/skill.md', external: true },
];

function NavDropdown({
  label,
  items,
  isOpen,
  onOpen,
  onClose,
  router,
}: {
  label: string;
  items: NavItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isActive = items.some((i) => i.href === router.pathname || (router.pathname.startsWith(i.href) && i.href !== '/'));

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mouseleave', h);
    return () => document.removeEventListener('mouseleave', h);
  }, [onClose]);

  return (
    <div ref={ref} className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] min-h-[var(--touch-min)] ${
          isActive ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }`}
      >
        {label}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 z-50 min-w-[220px]"
          >
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-lg py-2">
              {items.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col px-4 py-2.5 text-left hover:bg-[var(--accent)]/10 transition-colors rounded-lg mx-1"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
                    {item.description && <span className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</span>}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex flex-col px-4 py-2.5 text-left transition-colors rounded-lg mx-1 ${
                      router.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--accent)]/10 text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.description && <span className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</span>}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();
  const [referralOpen, setReferralOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const { disconnect, publicKey, connected } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (publicKey && typeof window !== 'undefined') {
      const refWallet = new URLSearchParams(window.location.search).get('ref');
      if (refWallet && refWallet !== publicKey.toBase58()) {
        fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referrerWallet: refWallet, referredWallet: publicKey.toBase58() }),
        }).catch(() => {});
      }
    }
  }, [publicKey]);

  const navLinkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium rounded-full transition-all min-h-[var(--touch-min)] flex items-center ${
      router.pathname === path
        ? 'text-[var(--accent)] bg-[var(--accent)]/10'
        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
    }`;

  return (
    <>
      <header
        className="w-full sticky top-0 z-[1000] isolate pt-[env(safe-area-inset-top)]"
        style={{
          height: 'var(--header-height)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div className="h-full max-w-[var(--content-max-width)] mx-auto px-[var(--content-padding)] flex items-center justify-between gap-4">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/brand/kogaion-icon.svg" alt="Kogaion" className="w-8 h-8 md:w-9 md:h-9 opacity-95" />
            <span className="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">Kogaion</span>
            <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--accent)]/20 text-[var(--accent)]">Beta</span>
          </Link>

          {/* Center — desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            <Link href="/discover" className={navLinkClass('/discover')}>
              Discover
            </Link>
            <Link href="/create-pool" className={navLinkClass('/create-pool')}>
              Launch
            </Link>
            {connected && publicKey && (
              <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                Dashboard
              </Link>
            )}
            <Link href="/service-providers" className={navLinkClass('/service-providers')}>
              Marketplace
            </Link>
            <NavDropdown label="More" items={moreNav} isOpen={moreOpen} onOpen={() => setMoreOpen(true)} onClose={() => setMoreOpen(false)} router={router} />
          </nav>

          {/* Right — actions + wallet */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href="https://x.com/KogaionSol"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/kogaionpack"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
              title="Telegram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            {address && (
              <button
                onClick={() => setReferralOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
                title="Invite"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            )}
            <div className="hidden md:block">
              <CreatePoolButton />
            </div>
            {address ? (
              <Button variant="outline" onClick={() => disconnect()} className="text-sm px-3 py-2 font-mono rounded-full min-h-9">
                {shortenAddress(address)}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setShowModal(true)} className="text-sm px-4 py-2 rounded-full min-h-9">
                Connect
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu — full-width drawer with grouped links */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[var(--border-default)] flex flex-col max-h-[85vh]"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <nav
                className="px-4 py-6 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-6 overscroll-contain"
                style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))', WebkitOverflowScrolling: 'touch' }}
              >
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-2">Product</div>
                  <div className="rounded-xl bg-[var(--bg-layer)] p-1 space-y-0.5">
                    {productNav.map((item) =>
                      item.external ? (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center min-h-12 px-4 rounded-lg text-[var(--text-primary)] font-medium hover:bg-[var(--accent)]/10"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileOpen(false);
                            router.push(item.href);
                          }}
                          className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                            router.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                    {connected && publicKey && (
                      <Link
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                          router.push('/dashboard');
                        }}
                        className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                          router.pathname === '/dashboard' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                        }`}
                      >
                        Dashboard
                      </Link>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-2">Build</div>
                  <div className="rounded-xl bg-[var(--bg-layer)] p-1 space-y-0.5">
                    {buildNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                          router.push(item.href);
                        }}
                        className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                          router.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-2">Community & Resources</div>
                  <div className="rounded-xl bg-[var(--bg-layer)] p-1 space-y-0.5">
                    {communityNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileOpen(false);
                          router.push(item.href);
                        }}
                        className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                          router.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {resourcesNav.map((item) =>
                      item.external ? (
                        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center min-h-12 px-4 rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--accent)]/10">
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileOpen(false);
                            router.push(item.href);
                          }}
                          className={`flex items-center min-h-12 px-4 rounded-lg font-medium ${
                            router.pathname === item.href ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
                <Link
                  href="/create-pool"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    router.push('/create-pool');
                  }}
                  className="flex items-center justify-center w-full min-h-12 rounded-xl font-semibold text-[var(--bg-base)] transition-opacity hover:opacity-95"
                  style={{ background: 'var(--accent)' }}
                >
                  Launch Token
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ReferralModal isOpen={referralOpen} onClose={() => setReferralOpen(false)} />
    </>
  );
};

export default Header;
