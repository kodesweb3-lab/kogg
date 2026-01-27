import '@/styles/globals.css';
import { Adapter, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import type { AppProps } from 'next/app';
import { Toaster } from 'sonner';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWindowWidthListener } from '@/lib/device';
import { AskKogaion } from '@/components/AskKogaion';
import { WolfThemeProvider } from '@/contexts/WolfThemeProvider';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// ErrorBoundary must be loaded client-side only to avoid SSR issues
// Create a wrapper component to ensure proper export
const ErrorBoundaryWrapper = dynamic(
  () => import('@/components/ErrorBoundary').then((mod) => {
    // Return a wrapper component that uses ErrorBoundary
    return {
      default: ({ children }: { children: React.ReactNode }) => {
        const { ErrorBoundary } = mod;
        return <ErrorBoundary>{children}</ErrorBoundary>;
      },
    };
  }),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const wallets: Adapter[] = useMemo(() => {
    // Filter out Phantom if it's already available as a standard wallet
    // This prevents the "Phantom was registered as a Standard Wallet" warning
    const adapters: Adapter[] = [];
    
    // Only add Phantom if not already detected as standard wallet
    if (typeof window !== 'undefined') {
      // Check if Phantom is already injected as a standard wallet
      const hasPhantomStandard = (window as any).solana?.isPhantom;
      if (!hasPhantomStandard) {
        adapters.push(new PhantomWalletAdapter());
      }
    } else {
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
    <ErrorBoundaryWrapper>
      <QueryClientProvider client={queryClient}>
        <WolfThemeProvider>
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
          <AnimatePresence mode="wait">
            <Component {...pageProps} key={router.asPath} />
          </AnimatePresence>
          <AskKogaion />
          </UnifiedWalletProvider>
        </WolfThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryWrapper>
  );
}
