import '@/styles/globals.css';
import { Adapter, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import type { AppProps } from 'next/app';
import { Toaster } from 'sonner';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWindowWidthListener } from '@/lib/device';
import { AskKogaion } from '@/components/AskKogaion';

export default function App({ Component, pageProps }: AppProps) {
  const wallets: Adapter[] = useMemo(() => {
    // Filter out Phantom if it's already available as a standard wallet
    // This prevents the "Phantom was registered as a Standard Wallet" warning
    const adapters: Adapter[] = [];
    
    // Only add Phantom if not already detected as standard wallet
    if (typeof window !== 'undefined' && !window.solana?.isPhantom) {
      adapters.push(new PhantomWalletAdapter());
    } else if (typeof window === 'undefined') {
      // SSR: include Phantom, it will be filtered client-side if needed
      adapters.push(new PhantomWalletAdapter());
    }
    
    adapters.push(new SolflareWalletAdapter());
    
    return adapters.filter(
      (item) => item && item.name && item.icon
    ) as Adapter[];
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  useWindowWidthListener();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UnifiedWalletProvider
          wallets={wallets}
          config={{
            env: 'mainnet-beta',
            autoConnect: true,
            metadata: {
              name: 'Kogaion',
              description: 'The most based token launchpad on Solana',
              url: 'https://kogaion.io',
              iconUrls: ['/favicon.ico'],
            },
            // notificationCallback: WalletNotification,
            theme: 'dark',
            lang: 'en',
          }}
        >
          <Toaster />
          <Component {...pageProps} />
          <AskKogaion />
        </UnifiedWalletProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
