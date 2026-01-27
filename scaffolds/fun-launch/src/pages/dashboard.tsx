'use client';

import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { shortenAddress } from '@/lib/utils';

type DashboardData = {
  wallet: string;
  isServiceProvider: boolean;
  serviceProvider?: {
    id: string;
    verified: boolean;
    verifiedAt: Date | null;
    tags: string[];
    description: string | null;
  } | null;
  tokensCreated: Array<{
    id: string;
    mint: string;
    name: string;
    symbol: string;
    tokenType: 'MEMECOIN' | 'RWA';
    createdAt: Date;
  }>;
  referralStats: {
    totalReferred: number;
    referrals: Array<{
      referredWallet: string;
      createdAt: Date;
    }>;
  };
};

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      const res = await fetch(`/api/dashboard?wallet=${publicKey.toBase58()}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    enabled: !!publicKey && connected,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!connected || !publicKey) {
    return (
      <Page>
        <div className="min-h-screen text-[var(--text-primary)] py-12 md:py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-8 rim-light text-center">
              <h1 className="text-3xl font-heading font-bold mb-4 text-aureate-base">
                Dashboard
              </h1>
              <p className="text-[var(--text-primary)]/80 font-body mb-6">
                Please connect your wallet to view your dashboard.
              </p>
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page>
        <div className="min-h-screen text-[var(--text-primary)] py-12 md:py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-8 rim-light text-center">
              <p className="text-[var(--text-primary)]/80 font-body">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !dashboardData) {
    return (
      <Page>
        <div className="min-h-screen text-[var(--text-primary)] py-12 md:py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-8 rim-light text-center">
              <h1 className="text-3xl font-heading font-bold mb-4 text-aureate-base">
                Error
              </h1>
              <p className="text-[var(--text-primary)]/80 font-body mb-6">
                Failed to load dashboard data.
              </p>
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-12 md:py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-aureate-base">
              Dashboard
            </h1>
            <p className="text-[var(--text-muted)] font-body">
              Wallet: {shortenAddress(dashboardData.wallet)}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Provider Section */}
            {dashboardData.isServiceProvider && dashboardData.serviceProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-xl p-6 md:p-8 rim-light"
              >
                <h2 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                  Service Provider Profile
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-[var(--text-muted)] font-body">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-body ${
                        dashboardData.serviceProvider.verified
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {dashboardData.serviceProvider.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  {dashboardData.serviceProvider.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-[var(--text-muted)] font-body">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dashboardData.serviceProvider.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-obsidian-surface rounded text-xs font-body text-aureate-base border border-aureate-base/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {dashboardData.serviceProvider.description && (
                    <div>
                      <span className="text-sm text-[var(--text-muted)] font-body">Description:</span>
                      <p className="mt-1 text-[var(--text-primary)]/80 font-body">
                        {dashboardData.serviceProvider.description}
                      </p>
                    </div>
                  )}
                  <Link href="/service-providers">
                    <Button variant="outline" className="w-full">
                      View Marketplace
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Tokens Created Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light"
            >
              <h2 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                Tokens Created
              </h2>
              {dashboardData.tokensCreated.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)] font-body mb-4">
                    You haven't created any tokens yet.
                  </p>
                  <Link href="/create-pool">
                    <Button>Launch Your First Token</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)] font-body">
                    {dashboardData.tokensCreated.length} token(s) created
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashboardData.tokensCreated.map((token) => (
                      <Link
                        key={token.id}
                        href={`/token/${token.mint}`}
                        className="block glass-card rounded-lg p-4 hover:bg-obsidian-surface/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-heading font-bold text-aureate-base">
                              {token.name} ({token.symbol})
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] font-body mt-1">
                              {token.tokenType} • {new Date(token.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Referral Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light"
            >
              <h2 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                Referral Stats
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-heading font-bold text-aureate-base mb-2">
                    {dashboardData.referralStats.totalReferred}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-body">
                    Total Referrals
                  </p>
                </div>
                {dashboardData.referralStats.referrals.length > 0 && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)] font-body mb-2">Recent Referrals:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dashboardData.referralStats.referrals.slice(0, 10).map((ref, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-[var(--text-muted)] font-body font-mono"
                        >
                          {shortenAddress(ref.referredWallet)} • {new Date(ref.createdAt).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Page>
  );
}
