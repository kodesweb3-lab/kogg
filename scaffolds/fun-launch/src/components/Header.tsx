import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';
import { useRouter } from 'next/router';

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Discover', href: '/discover' },
    { label: 'Launch', href: '/create-pool' },
    { label: 'Lore', href: '/lore' },
    { label: 'Wolves', href: '/wolves' },
    { label: 'Docs', href: '#', external: false, disabled: true },
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
    </header>
  );
};

export default Header;
