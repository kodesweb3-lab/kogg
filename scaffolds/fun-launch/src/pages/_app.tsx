import '@/styles/globals.css';
import { Adapter, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import type { AppProps } from 'next/app';
import { Toaster } from 'sonner';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo, useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWindowWidthListener } from '@/lib/device';
import { AskKogaion } from '@/components/AskKogaion';
import { WolfThemeProvider } from '@/contexts/WolfThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';

// SSR-safe ErrorBoundary wrapper - renders children immediately on SSR, wraps with ErrorBoundary on client
function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  const [ErrorBoundary, setErrorBoundary] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only load ErrorBoundary on client-side
    if (typeof window !== 'undefined') {
      import('@/components/ErrorBoundary')
        .then((mod) => {
          const EB = mod.ErrorBoundary || mod.default;
          setErrorBoundary(() => EB);
        })
        .catch((err) => {
          console.error('[ErrorBoundaryWrapper] Failed to load ErrorBoundary:', err);
          // Continue without ErrorBoundary if it fails to load
        });
    }
  }, []);

  // On SSR or before ErrorBoundary loads, render children directly
  if (typeof window === 'undefined' || !ErrorBoundary) {
    return <>{children}</>;
  }

  // Once ErrorBoundary is loaded, wrap children
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

// Fallback UI for critical errors
function FallbackUI({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen bg-obsidian-base text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-xl p-8 rim-light">
        <h1 className="text-2xl font-heading font-bold mb-4 text-aureate-base">
          Kogaion
        </h1>
        <p className="text-[var(--text-primary)]/80 mb-4">
          {error 
            ? 'An error occurred while loading the application. Please refresh the page.'
            : 'Loading...'}
        </p>
        {error && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-aureate-base/80 hover:bg-aureate-base text-obsidian-base font-heading font-bold rounded-lg transition-all"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wallets: Adapter[] = useMemo(() => {
    try {
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
    } catch (err) {
      console.error('[App] Error initializing wallet adapters:', err);
      const error = err instanceof Error ? err : new Error('Failed to initialize wallets');
      setError(error);
      setHasError(true);
      return [];
    }
  }, []);

  const queryClient = useMemo(() => {
    try {
      return new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      });
    } catch (err) {
      console.error('[App] Error creating QueryClient:', err);
      const error = err instanceof Error ? err : new Error('Failed to initialize QueryClient');
      setError(error);
      setHasError(true);
      return new QueryClient();
    }
  }, []);

  // Initialize window width listener (non-critical)
  useWindowWidthListener();

  // If critical error, show fallback
  if (hasError && !queryClient) {
    return <FallbackUI error={error || undefined} />;
  }

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
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={router.asPath}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ background: 'var(--obsidian-base, #0a0a0a)' }}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
            <AskKogaion />
          </UnifiedWalletProvider>
        </WolfThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryWrapper>
  );
}
