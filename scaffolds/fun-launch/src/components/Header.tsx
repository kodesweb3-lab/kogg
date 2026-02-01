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

const productNav: NavItem[] = [
  { label: 'Launch Token', href: '/create-pool', description: 'Create and list your token' },
  { label: 'Discover', href: '/discover', description: 'Explore all tokens' },
  { label: 'Marketplace', href: '/service-providers', description: 'Service providers & KOLs' },
];

const buildNav: NavItem[] = [
  { label: 'IDE', href: '/ide', description: 'In-browser code editor' },
  { label: 'Projects', href: '/playground/projects', description: 'Contest projects & votes' },
];

const communityNav: NavItem[] = [
  { label: 'Agents Playground', href: '/agents-playground', description: 'Global chat for agents' },
  { label: 'For Agents', href: '/for-agents', description: 'API docs & agent hub' },
  { label: 'Leaderboard', href: '/leaderboard', description: 'Top creators' },
];

const resourcesNav: NavItem[] = [
  { label: 'Dev Log', href: '/dev-log', description: 'Updates & changelog' },
  { label: 'Lore', href: '/lore', description: 'Brand & story' },
  { label: 'Wolves', href: '/wolves', description: 'Community' },
  { label: 'Skill (API)', href: '/skill.md', description: 'Full API reference', external: true },
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
    <div
      ref={ref}
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive ? 'text-[var(--tech-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
            className="absolute left-0 top-full pt-1 z-50 min-w-[220px]"
          >
            <div className="rounded-lg border border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] shadow-xl py-1">
              {items.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col px-4 py-2.5 text-left hover:bg-[var(--tech-surface-elevated)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</span>
                    )}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex flex-col px-4 py-2.5 text-left hover:bg-[var(--tech-surface-elevated)] transition-colors ${
                      router.pathname === item.href ? 'bg-[var(--tech-accent)]/10' : ''
                    }`}
                  >
                    <span className={`text-sm font-medium ${router.pathname === item.href ? 'text-[var(--tech-accent)]' : 'text-[var(--text-primary)]'}`}>
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</span>
                    )}
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
  const [productOpen, setProductOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const { disconnect, publicKey, connected } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  useEffect(() => {
    setMobileOpen(false);
    setProductOpen(false);
    setBuildOpen(false);
    setCommunityOpen(false);
    setResourcesOpen(false);
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

  return (
    <>
      <header className="w-full border-b border-[var(--tech-border-elevated)] bg-[var(--tech-surface)]/98 backdrop-blur-md sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/brand/kogaion-icon.svg" alt="Kogaion" className="w-8 h-8 md:w-9 md:h-9" />
              <span className="text-lg md:text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                Kogaion
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] border border-[var(--tech-border-elevated)] rounded">
                Beta
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <NavDropdown
                label="Product"
                items={productNav}
                isOpen={productOpen}
                onOpen={() => {
                  setBuildOpen(false);
                  setCommunityOpen(false);
                  setResourcesOpen(false);
                  setProductOpen(true);
                }}
                onClose={() => setProductOpen(false)}
                router={router}
              />
              <NavDropdown
                label="Build"
                items={buildNav}
                isOpen={buildOpen}
                onOpen={() => {
                  setProductOpen(false);
                  setCommunityOpen(false);
                  setResourcesOpen(false);
                  setBuildOpen(true);
                }}
                onClose={() => setBuildOpen(false)}
                router={router}
              />
              <NavDropdown
                label="Community"
                items={communityNav}
                isOpen={communityOpen}
                onOpen={() => {
                  setProductOpen(false);
                  setBuildOpen(false);
                  setResourcesOpen(false);
                  setCommunityOpen(true);
                }}
                onClose={() => setCommunityOpen(false)}
                router={router}
              />
              <NavDropdown
                label="Resources"
                items={resourcesNav}
                isOpen={resourcesOpen}
                onOpen={() => {
                  setProductOpen(false);
                  setBuildOpen(false);
                  setCommunityOpen(false);
                  setResourcesOpen(true);
                }}
                onClose={() => setResourcesOpen(false)}
                router={router}
              />
              {connected && publicKey && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    router.pathname === '/dashboard' ? 'text-[var(--tech-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right: social, referral, launch, wallet */}
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://x.com/KogaionSol"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors rounded-md"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/kogaionpack"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors rounded-md"
                title="Telegram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              {address && (
                <button
                  onClick={() => setReferralOpen(true)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--tech-accent)] transition-colors rounded-md"
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
                <Button onClick={() => disconnect()} className="text-sm px-3 py-2">
                  {shortenAddress(address)}
                </Button>
              ) : (
                <Button onClick={() => setShowModal(true)} className="text-sm px-3 py-2">
                  Connect
                </Button>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[var(--tech-border-elevated)] bg-[var(--tech-surface)]"
            >
              <nav className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2">Product</div>
                {productNav.map((item) => (
                  item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-2.5 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]">
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-md text-sm font-medium ${router.pathname === item.href ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10' : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]'}`}>
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2 pt-4">Build</div>
                {buildNav.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-md text-sm font-medium ${router.pathname === item.href ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10' : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]'}`}>
                    {item.label}
                  </Link>
                ))}
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2 pt-4">Community</div>
                {communityNav.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-md text-sm font-medium ${router.pathname === item.href ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10' : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]'}`}>
                    {item.label}
                  </Link>
                ))}
                {connected && publicKey && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-md text-sm font-medium ${router.pathname === '/dashboard' ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10' : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]'}`}>
                    Dashboard
                  </Link>
                )}
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2 pt-4">Resources</div>
                {resourcesNav.map((item) => (
                  item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-2.5 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]">
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block px-3 py-2.5 rounded-md text-sm font-medium ${router.pathname === item.href ? 'text-[var(--tech-accent)] bg-[var(--tech-accent)]/10' : 'text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)]'}`}>
                      {item.label}
                    </Link>
                  )
                ))}
                <div className="pt-4 mt-2 border-t border-[var(--tech-border-elevated)]">
                  <Link href="/create-pool" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-[var(--tech-surface-elevated)] border border-[var(--tech-border-elevated)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--tech-accent)]">
                    Launch Token
                  </Link>
                </div>
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
