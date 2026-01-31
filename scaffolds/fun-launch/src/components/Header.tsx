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

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { disconnect, publicKey, connected } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    { label: 'Home', href: '/' },
    { label: 'Discover', href: '/discover' },
    { label: 'Launch', href: '/create-pool' },
    { label: 'Marketplace', href: '/service-providers' },
    { label: 'Agents Playground', href: '/agents-playground' },
    { label: 'Leaders', href: '/leaderboard' },
    { label: 'Dev Log', href: '/dev-log' },
    { label: 'Lore', href: '/lore' },
    { label: 'Wolves', href: '/wolves' },
    ...(connected && publicKey ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ] as Array<{ label: string; href: string; external?: boolean; disabled?: boolean }>;

  return (
    <>
      <header className="w-full px-4 py-3 flex items-center justify-between border-b border-dacian-steel-steel/40 bg-dacian-steel-gunmetal/90 backdrop-blur-sm sticky top-0 z-40 steel-surface relative overflow-hidden">
        {/* Subtle steam effect at bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-steam-mist-medium to-transparent opacity-30" />
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <img 
            src="/brand/kogaion-icon.svg" 
            alt="Kogaion" 
            className="w-8 h-8 md:w-12 md:h-12"
          />
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-lg md:text-3xl font-heading font-bold text-mystic-steam-copper tracking-wide">
              KOGAION
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-mystic-steam-copper/20 text-mystic-steam-copper rounded border border-mystic-steam-copper/30 uppercase tracking-wider">
              Beta
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => {
            if (item.disabled) {
              return (
                <span
                  key={item.href}
                  className="text-sm font-body font-medium text-mystic-steam-parchment/40 cursor-not-allowed"
                  title="Coming soon"
                >
                  {item.label}
                </span>
              );
            }
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-body font-medium text-mystic-steam-parchment/70 hover:text-mystic-steam-copper transition-colors"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-body font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'text-mystic-steam-copper'
                    : 'text-mystic-steam-parchment/70 hover:text-mystic-steam-copper'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Social Links */}
          <div className="flex items-center gap-1">
            <a
              href="https://x.com/KogaionSol"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors"
              title="Follow on X"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/kogaionpack"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors"
              title="Join Telegram"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
          </div>
          
          {/* Referral Button */}
          {address && (
            <button
              onClick={() => setIsReferralOpen(true)}
              className="p-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors"
              title="Invite to Pack"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
          
          <div className="hidden md:block">
            <CreatePoolButton />
          </div>
          {address ? (
            <Button onClick={() => disconnect()} className="text-xs md:text-sm px-2 md:px-4">
              {shortenAddress(address)}
            </Button>
          ) : (
            <Button
              onClick={handleConnectWallet}
              className="text-xs md:text-sm px-3 md:px-4"
            >
              Connect
            </Button>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-parchment transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="lg:hidden bg-mystic-steam-ash border-b border-mystic-steam-copper/30 overflow-hidden sticky top-[57px] z-30"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg font-body font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'bg-mystic-steam-copper/20 text-mystic-steam-copper'
                      : 'text-mystic-steam-parchment/70 hover:bg-mystic-steam-ash/80 hover:text-mystic-steam-parchment'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-mystic-steam-copper/20">
                <Link
                  href="/create-pool"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-mystic-steam-ash border border-mystic-steam-copper/30 text-mystic-steam-parchment font-heading font-bold rounded-lg hover:border-mystic-steam-copper/50 transition-colors"
                >
                  Launch Token
                </Link>
              </div>
              
              {/* Social Links in Mobile Menu */}
              <div className="flex items-center justify-center gap-4 pt-4 mt-2 border-t border-mystic-steam-copper/20">
                <a
                  href="https://x.com/KogaionSol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="font-body text-sm">Twitter</span>
                </a>
                <a
                  href="https://t.me/kogaionpack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span className="font-body text-sm">Telegram</span>
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
