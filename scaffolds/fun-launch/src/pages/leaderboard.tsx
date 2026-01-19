import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

type LeaderboardEntry = {
  rank: number;
  wallet: string;
  tokensCreated: number;
  latestToken?: {
    symbol: string;
    name: string;
    mint: string;
  };
};

type LeaderboardData = {
  leaderboard: LeaderboardEntry[];
  stats: {
    totalTokens: number;
    totalCreators: number;
  };
};

function useLeaderboard() {
  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function getRankBadge(rank: number): { color: string; icon: string } {
  switch (rank) {
    case 1:
      return { color: 'text-yellow-400', icon: '🥇' };
    case 2:
      return { color: 'text-gray-300', icon: '🥈' };
    case 3:
      return { color: 'text-amber-600', icon: '🥉' };
    default:
      return { color: 'text-gray-500', icon: '' };
  }
}

export default function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <Page>
      <div className="min-h-screen bg-ritual-bg text-gray-100 py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-ritual-amber-400">
              Pack Leaders
            </h1>
            <p className="text-lg text-gray-400 font-body">
              Top token creators on Kogaion
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-ritual-bgElevated rounded-xl p-6 border border-ritual-amber-500/20 text-center">
              <div className="text-3xl font-heading font-bold text-ritual-amber-400">
                {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : data?.stats.totalTokens || 0}
              </div>
              <div className="text-sm text-gray-400 font-body mt-1">Tokens Summoned</div>
            </div>
            <div className="bg-ritual-bgElevated rounded-xl p-6 border border-ritual-amber-500/20 text-center">
              <div className="text-3xl font-heading font-bold text-ritual-amber-400">
                {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : data?.stats.totalCreators || 0}
              </div>
              <div className="text-sm text-gray-400 font-body mt-1">Pack Members</div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-ritual-bgElevated rounded-xl border border-ritual-amber-500/20 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-ritual-amber-500/20">
              <h2 className="font-heading font-bold text-xl text-ritual-amber-400">Top Creators</h2>
            </div>

            <div className="divide-y divide-ritual-amber-500/10">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </div>
                ))
              ) : data?.leaderboard.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500 font-body">
                  No creators yet. Be the first to launch a token!
                </div>
              ) : (
                data?.leaderboard.map((entry, index) => {
                  const badge = getRankBadge(entry.rank);
                  return (
                    <motion.div
                      key={entry.wallet}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-ritual-bgHover transition-colors"
                    >
                      {/* Rank */}
                      <div className={`w-8 text-center font-heading font-bold ${badge.color}`}>
                        {badge.icon || `#${entry.rank}`}
                      </div>

                      {/* Wallet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://solscan.io/account/${entry.wallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-white hover:text-ritual-amber-400 transition-colors"
                          >
                            {truncateWallet(entry.wallet)}
                          </a>
                          {entry.rank <= 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-ritual-amber-500/20 text-ritual-amber-400 rounded">
                              TOP {entry.rank}
                            </span>
                          )}
                        </div>
                        {entry.latestToken && (
                          <Link
                            href={`/token/${entry.latestToken.mint}`}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            Latest: ${entry.latestToken.symbol}
                          </Link>
                        )}
                      </div>

                      {/* Tokens Created */}
                      <div className="text-right">
                        <div className="font-heading font-bold text-white">
                          {entry.tokensCreated}
                        </div>
                        <div className="text-xs text-gray-500 font-body">
                          {entry.tokensCreated === 1 ? 'token' : 'tokens'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Link
              href="/create-pool"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ritual-amber-500 hover:bg-ritual-amber-600 text-black font-heading font-bold rounded-lg transition-colors"
            >
              Launch Your Token
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
