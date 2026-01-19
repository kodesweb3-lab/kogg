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
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()].filter(
      (item) => item && item.name && item.icon
    ) as Adapter[];
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  useWindowWidthListener();

  return (
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
  );
}
