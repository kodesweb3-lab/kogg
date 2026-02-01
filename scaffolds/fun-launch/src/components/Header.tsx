import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo, useState, useEffect } from 'react';
import { shortenAddress } from '@/lib/utils';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const ReferralModal = dynamic(() => import('./ReferralModal'), { ssr: false });

const primaryNav = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Launch', href: '/create-pool' },
  { label: 'Marketplace', href: '/service-providers' },
  { label: 'Playground', href: '/agents-playground' },
  { label: 'For Agents', href: '/for-agents' },
  { label: 'Leaders', href: '/leaderboard' },
] as Array<{ label: string; href: string; external?: boolean }>;

const moreNav = [
  { label: 'Dev Log', href: '/dev-log' },
  { label: 'Lore', href: '/lore' },
  { label: 'Wolves', href: '/wolves' },
  { label: 'Skill', href: '/skill.md', external: true },
] as Array<{ label: string; href: string; external?: boolean }>;

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const { disconnect, publicKey, connected } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  }, [router.pathname]);

  // Track referral when user connects wallet
  useEffect(() => {
    if (publicKey && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refWallet = urlParams.get('ref');
      
      if (refWallet && refWallet !== publicKey.toBase58()) {
        // Track the referral
        fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrerWallet: refWallet,
            referredWallet: publicKey.toBase58(),
          }),
        }).catch(() => {});
      }
    }
  }, [publicKey]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  const navItems = [
    ...primaryNav,
    ...moreNav,
    ...(connected && publicKey ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ] as Array<{ label: string; href: string; external?: boolean; disabled?: boolean }>;

  return (
    <>
      <header className="w-full px-3 py-2 flex items-center justify-between border-b border-[var(--tech-border-elevated)] bg-[var(--tech-surface)]/95 backdrop-blur-sm sticky top-0 z-40 relative pt-[env(safe-area-inset-top)]">
        <Link href="/" className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <img src="/brand/kogaion-icon.svg" alt="Kogaion" className="w-7 h-7 md:w-8 md:h-8" />
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap text-base md:text-xl font-display font-semibold text-[var(--tech-accent)] tracking-wide">
              KOGAION
            </span>
            <span className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-semibold bg-[var(--tech-accent)]/15 text-[var(--tech-accent)] rounded border border-[var(--tech-accent)]/25 uppercase tracking-wider">
              Beta
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-body font-medium transition-colors ${
                router.pathname === item.href ? 'text-[var(--tech-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--tech-accent)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {connected && publicKey && (
            <Link
              href="/dashboard"
              className={`text-xs font-body font-medium transition-colors ${
                router.pathname === '/dashboard' ? 'text-[var(--tech-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--tech-accent)]'
              }`}
            >
              Dashboard
            </Link>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreOpen((v) => !v)}
              className={`text-xs font-body font-medium transition-colors ${
                moreNav.some((i) => i.href === router.pathname || (i.external && router.pathname === '/for-agents'))
                  ? 'text-[var(--tech-accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--tech-accent)]'
              }`}
            >
              More
            </button>
            <AnimatePresence>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setIsMoreOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] py-1 shadow-lg"
                  >
                    {moreNav.map((item) =>
                      item.external ? (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-3 py-2 text-xs font-body text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)] hover:text-[var(--tech-accent)]"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={`block px-3 py-2 text-xs font-body ${
                            router.pathname === item.href
                              ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10'
                              : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)] hover:text-[var(--tech-accent)]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-0.5 md:gap-2">
          <div className="flex items-center gap-0.5">
            <a
              href="https://x.com/KogaionSol"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors"
              title="Follow on X"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/kogaionpack"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors"
              title="Join Telegram"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          </div>
          
          {/* Referral Button */}
          {address && (
            <button
              onClick={() => setIsReferralOpen(true)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors"
              title="Invite to Pack"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
          
          <div className="hidden md:block">
            <CreatePoolButton />
          </div>
          {address ? (
            <Button onClick={() => disconnect()} className="text-xs px-2 py-1.5 md:px-3 md:py-2">
              {shortenAddress(address)}
            </Button>
          ) : (
            <Button onClick={handleConnectWallet} className="text-xs px-2 py-1.5 md:px-3 md:py-2">
              Connect
            </Button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[var(--tech-surface)] border-b border-[var(--tech-border-elevated)] overflow-hidden sticky z-30"
            style={{ top: 'calc(2.5rem + env(safe-area-inset-top))' }}
          >
            <nav className="flex flex-col p-3 gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'bg-[var(--tech-accent)]/15 text-[var(--tech-accent)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--tech-surface-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-1 border-t border-[var(--tech-border)]">
                <Link
                  href="/create-pool"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[var(--tech-surface-elevated)] border border-[var(--tech-border-elevated)] text-[var(--text-primary)] font-body font-semibold rounded-md text-sm hover:border-[var(--tech-accent)] transition-colors"
                >
                  Launch Token
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 pt-3 mt-2 border-t border-[var(--tech-border)]">
                <a href="https://x.com/KogaionSol" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  <span>X</span>
                </a>
                <a href="https://t.me/kogaionpack" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  <span>Telegram</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral Modal */}
      <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
    </>
  );
};

export default Header;
