'use client';

import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { shortenAddress } from '@/lib/utils';
import { ReadableNumber } from '@/components/ui/ReadableNumber';
import { useState, useMemo } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { ServiceProviderEditModal } from '@/components/ServiceProvider/ServiceProviderEditModal';

type DashboardData = {
  wallet: string;
  isServiceProvider: boolean;
  serviceProvider?: {
    id: string;
    verified: boolean;
    verifiedAt: Date | null;
    tags: string[];
    description: string | null;
    email: string | null;
    telegram: string | null;
    twitterHandle: string | null;
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
  statistics: {
    totalTokens: number;
    totalVolume: number;
    totalMarketCap: number;
    averagePrice: number;
    totalHolders: number;
    tokensByType: {
      MEMECOIN: number;
      RWA: number;
    };
    tokensCreatedByMonth: Array<{
      month: string;
      count: number;
    }>;
  };
};

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      const res = await fetch(`/api/dashboard?wallet=${publicKey.toBase58()}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    enabled: !!publicKey && connected,
    refetchInterval: 30000,
  });

  const handleEditSuccess = () => {
    refetch();
  };

  const sortedTokens = useMemo(() => {
    if (!dashboardData?.tokensCreated) return [];
    const tokens = [...dashboardData.tokensCreated];
    return tokens.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'type') {
        comparison = a.tokenType.localeCompare(b.tokenType);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [dashboardData?.tokensCreated, sortBy, sortOrder]);

  if (!connected || !publicKey) {
    return (
      <Page>
        <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
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
        <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
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
        <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
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

  const stats = dashboardData.statistics;

  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 text-aureate-base">
                  Analytics Dashboard
                </h1>
                <p className="text-[var(--text-muted)] font-body font-mono text-sm">
                  {shortenAddress(dashboardData.wallet)}
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link href="/create-pool">
                  <Button className="bg-aureate-base/80 hover:bg-aureate-base text-obsidian-base">
                    Launch Token
                  </Button>
                </Link>
                {!dashboardData.isServiceProvider && (
                  <Link href="/service-providers/register">
                    <Button variant="outline">
                      Register as Provider
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Statistics Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <div className="glass-card rounded-xl p-6 rim-light border-aureate-base/30">
              <div className="text-sm text-[var(--text-muted)] font-body mb-2">Portfolio Value</div>
              <div className="text-3xl font-heading font-bold text-aureate-base">
                <ReadableNumber format="compact" num={stats.totalMarketCap} prefix="$" />
              </div>
              <div className="text-xs text-[var(--text-muted)] font-body mt-2">
                Combined Market Cap
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 rim-light">
              <div className="text-sm text-[var(--text-muted)] font-body mb-2">Total Tokens</div>
              <div className="text-3xl font-heading font-bold text-aureate-base">
                {stats.totalTokens}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-body mt-2">
                {stats.tokensByType.MEMECOIN} MEME • {stats.tokensByType.RWA} RWA
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 rim-light">
              <div className="text-sm text-[var(--text-muted)] font-body mb-2">Total Volume</div>
              <div className="text-3xl font-heading font-bold text-aureate-base">
                <ReadableNumber format="compact" num={stats.totalVolume} prefix="$" />
              </div>
              <div className="text-xs text-[var(--text-muted)] font-body mt-2">
                24h Volume
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 rim-light">
              <div className="text-sm text-[var(--text-muted)] font-body mb-2">Total Holders</div>
              <div className="text-3xl font-heading font-bold text-aureate-base">
                <ReadableNumber format="compact" num={stats.totalHolders} />
              </div>
              <div className="text-xs text-[var(--text-muted)] font-body mt-2">
                Across All Tokens
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Service Provider Section */}
            {dashboardData.isServiceProvider && dashboardData.serviceProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-6 md:p-8 rim-light"
              >
                <h2 className="text-xl font-heading font-bold mb-4 text-aureate-light">
                  Service Provider
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-[var(--text-muted)] font-body">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-body ${
                        dashboardData.serviceProvider.verified
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {dashboardData.serviceProvider.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {dashboardData.serviceProvider.tags.length > 0 && (
                    <div>
                      <span className="text-xs text-[var(--text-muted)] font-body">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dashboardData.serviceProvider.tags.slice(0, 5).map((tag) => (
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      Edit Profile
                    </Button>
                    <Link href="/service-providers" className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        View Marketplace
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light"
            >
              <h2 className="text-xl font-heading font-bold mb-4 text-aureate-light">
                Performance Metrics
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[var(--text-muted)] font-body mb-1">Avg. Price</div>
                  <div className="text-2xl font-heading font-bold text-aureate-base">
                    <ReadableNumber format="compact" num={stats.averagePrice} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] font-body mb-1">Avg. Holders/Token</div>
                  <div className="text-2xl font-heading font-bold text-aureate-base">
                    {stats.totalTokens > 0 ? Math.round(stats.totalHolders / stats.totalTokens) : 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] font-body mb-1">Success Rate</div>
                  <div className="text-2xl font-heading font-bold text-aureate-base">
                    {stats.totalTokens > 0 ? Math.round((stats.tokensByType.MEMECOIN + stats.tokensByType.RWA) / stats.totalTokens * 100) : 0}%
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Referral Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light"
            >
              <h2 className="text-xl font-heading font-bold mb-4 text-aureate-light">
                Referral Network
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-heading font-bold text-aureate-base mb-2">
                    {dashboardData.referralStats.totalReferred}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-body">
                    Total Referrals
                  </div>
                </div>
                {dashboardData.referralStats.referrals.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--text-muted)] font-body mb-2">Recent:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {dashboardData.referralStats.referrals.slice(0, 5).map((ref, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-[var(--text-muted)] font-body font-mono"
                        >
                          {shortenAddress(ref.referredWallet)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Token Analytics Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-6 md:p-8 rim-light"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-aureate-light mb-4 md:mb-0">
                Token Portfolio
              </h2>
              {dashboardData.tokensCreated.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'type')}
                    className="px-3 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] text-sm font-body"
                  >
                    <option value="createdAt">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="type">Sort by Type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] text-sm font-body hover:bg-obsidian-elevated transition-colors"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              )}
            </div>

            {dashboardData.tokensCreated.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--text-muted)] font-body mb-4">
                  No tokens created yet.
                </p>
                <Link href="/create-pool">
                  <Button>Launch Your First Token</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-obsidian-border">
                      <th className="text-left py-3 px-4 text-sm font-heading font-bold text-aureate-base">Token</th>
                      <th className="text-left py-3 px-4 text-sm font-heading font-bold text-aureate-base">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-heading font-bold text-aureate-base">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-heading font-bold text-aureate-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTokens.map((token) => (
                      <tr
                        key={token.id}
                        className="border-b border-obsidian-border/50 hover:bg-obsidian-surface/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-heading font-bold text-aureate-base">
                              {token.name}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-body font-mono">
                              {token.symbol}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-body ${
                            token.tokenType === 'MEMECOIN'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {token.tokenType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-[var(--text-muted)] font-body">
                          {new Date(token.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link href={`/token/${token.mint}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Creation Timeline Chart (Simple Bar Chart using CSS) */}
          {stats.tokensCreatedByMonth.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light mt-8"
            >
              <h2 className="text-2xl font-heading font-bold mb-6 text-aureate-light">
                Token Creation Timeline
              </h2>
              <div className="space-y-3">
                {stats.tokensCreatedByMonth.map((item) => {
                  const maxCount = Math.max(...stats.tokensCreatedByMonth.map((i) => i.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={item.month} className="flex items-center gap-4">
                      <div className="w-24 text-xs text-[var(--text-muted)] font-body font-mono">
                        {item.month}
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-6 bg-obsidian-surface rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-aureate-base/80 to-aureate-light transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-heading font-bold text-aureate-base">
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Service Provider Edit Modal */}
      {dashboardData?.isServiceProvider && dashboardData.serviceProvider && (
        <ServiceProviderEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          serviceProvider={dashboardData.serviceProvider}
          onSuccess={handleEditSuccess}
        />
      )}
    </Page>
  );
}
