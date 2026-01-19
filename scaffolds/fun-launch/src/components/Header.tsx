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

  const { disconnect, publicKey } = useWallet();
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
    { label: 'Leaders', href: '/leaderboard' },
    { label: 'Lore', href: '/lore' },
    { label: 'Wolves', href: '/wolves' },
  ] as Array<{ label: string; href: string; external?: boolean; disabled?: boolean }>;

  return (
    <>
      <header className="w-full px-4 py-3 flex items-center justify-between border-b border-ritual-amber-500/20 bg-ritual-bg/80 backdrop-blur-sm sticky top-0 z-40">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <img 
            src="/brand/kogaion-icon.svg" 
            alt="Kogaion" 
            className="w-8 h-8 md:w-12 md:h-12"
          />
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-lg md:text-3xl font-heading font-bold bg-gradient-to-r from-ritual-amber-300 to-ritual-amber-500 bg-clip-text text-transparent">
              KOGAION
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-ritual-amber-500/20 text-ritual-amber-400 rounded border border-ritual-amber-500/30 uppercase tracking-wider">
              Beta
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            if (item.disabled) {
              return (
                <span
                  key={item.href}
                  className="text-sm font-body font-medium text-gray-500 cursor-not-allowed"
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
                  className="text-sm font-body font-medium text-gray-300 hover:text-ritual-amber-400 transition-colors"
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
                    ? 'text-ritual-amber-400'
                    : 'text-gray-300 hover:text-ritual-amber-400'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {address && (
            <button
              onClick={() => setIsReferralOpen(true)}
              className="p-2 text-gray-400 hover:text-ritual-amber-400 transition-colors"
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
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
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
            className="lg:hidden bg-ritual-bgElevated border-b border-ritual-amber-500/20 overflow-hidden sticky top-[57px] z-30"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg font-body font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'bg-ritual-amber-500/20 text-ritual-amber-400'
                      : 'text-gray-300 hover:bg-ritual-bgHover hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-ritual-amber-500/10">
                <Link
                  href="/create-pool"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-ritual-amber-500 text-black font-heading font-bold rounded-lg"
                >
                  Launch Token
                </Link>
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
