import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo, useState, useEffect } from 'react';
import { shortenAddress } from '@/lib/utils';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ReferralModal = dynamic(() => import('./ReferralModal'), { ssr: false });

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

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
    <header className="w-full px-4 py-3 flex items-center justify-between border-b border-ritual-amber-500/20 bg-ritual-bg/80 backdrop-blur-sm">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3">
        <img 
          src="/brand/kogaion-icon.svg" 
          alt="Kogaion" 
          className="w-10 h-10 md:w-12 md:h-12"
        />
        <span className="whitespace-nowrap text-xl md:text-3xl font-heading font-bold bg-gradient-to-r from-ritual-amber-300 to-ritual-amber-500 bg-clip-text text-transparent">
          KOGAION
        </span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-6">
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
      <div className="flex items-center gap-4">
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
        <CreatePoolButton />
        {address ? (
          <Button onClick={() => disconnect()}>{shortenAddress(address)}</Button>
        ) : (
          <Button
            onClick={() => {
              handleConnectWallet();
            }}
          >
            <span className="hidden md:block">Connect Wallet</span>
            <span className="block md:hidden">Connect</span>
          </Button>
        )}
      </div>

      {/* Referral Modal */}
      <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
    </header>
  );
};

export default Header;
