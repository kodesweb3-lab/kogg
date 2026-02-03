import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';
import { useLocalTokens } from '@/hooks/useLocalTokens';
import Page from '@/components/ui/Page/Page';
import { shortenAddress } from '@/lib/utils';

export default function LandingPage() {
  const { setShowModal } = useUnifiedWalletContext();
  const { connected } = useWallet();
  const router = useRouter();

  const { data: recentTokensData } = useLocalTokens({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const recentTokens = recentTokensData?.data || [];
  const hasWallet = connected;

  return (
    <Page>
      <div className="min-h-0 text-[var(--text-primary)] lg:min-h-screen">
        {/* Minimal hub: hero + CTAs + recent strip */}
        <section className="py-14 md:py-20 px-4 border-b border-[var(--cyber-accent)]/15">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--cyber-accent)] border border-[var(--cyber-accent)]/50 rounded">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cyber-accent)]/70" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--cyber-accent)]" />
                </span>
                Live on Solana Mainnet
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.2em] text-[var(--text-primary)] mb-3 font-display"
            >
              KOGAION
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-lg md:text-xl font-body text-[var(--cyber-accent)] font-medium tracking-wide mb-10"
            >
              High-tech launchpad on Solana
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                variant="primary"
                onClick={() => router.push('/discover')}
                className="min-h-[var(--button-min-height-touch)] px-8 py-3.5 text-sm"
              >
                Discover
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/create-pool')}
                className="min-h-[var(--button-min-height-touch)] px-8 py-3.5 text-sm"
              >
                Launch Token
              </Button>
              {hasWallet ? (
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="min-h-[var(--button-min-height-touch)] px-8 py-3.5 text-sm"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowModal(true)}
                  className="min-h-[var(--button-min-height-touch)] px-8 py-3.5 text-sm"
                >
                  Connect Wallet
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Recent / Trending strip */}
        <section className="py-10 md:py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-display font-bold uppercase tracking-widest text-[var(--text-primary)]">
                Recent
              </h2>
              <Link
                href="/discover"
                className="text-sm font-medium text-[var(--cyber-accent)] hover:underline min-h-[44px] inline-flex items-center"
              >
                View all
              </Link>
            </div>
            {recentTokens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTokens.slice(0, 6).map((token, idx) => (
                  <motion.div
                    key={token.mint}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/token/${token.mint}`}
                      className="flex items-center gap-3 rounded-lg card-cyber p-4 min-h-[60px] touch-manipulation"
                    >
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-[var(--cyber-accent)]/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--cyber-surface)] border border-[var(--cyber-accent)]/20 flex items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
                          {token.symbol?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {token.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">
                          {shortenAddress(token.mint)}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                No recent tokens yet. Be the first to{' '}
                <Link href="/create-pool" className="text-[var(--cyber-accent)] hover:underline">
                  launch
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      </div>
    </Page>
  );
}
