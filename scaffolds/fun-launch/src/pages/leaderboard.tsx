import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { AlphaSigil, SentinelSigil, ElderSigil } from '@/components/icons/SigilIcons';

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

function getRankBadge(rank: number): { color: string; Sigil: React.ComponentType<{ className?: string }> | null; label: string } {
  switch (rank) {
    case 1:
      return { color: 'text-aureate-base', Sigil: AlphaSigil, label: 'Alpha' };
    case 2:
    case 3:
      return { color: 'text-aureate-light', Sigil: SentinelSigil, label: 'Sentinel' };
    default:
      if (rank <= 10) {
        return { color: 'text-aureate-dark', Sigil: ElderSigil, label: 'Elder' };
      }
      return { color: 'text-mystic-steam-parchment/40', Sigil: null, label: '' };
  }
}

export default function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();

  return (
    <Page>
      <div className="min-h-screen text-mystic-steam-parchment py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-mystic-steam-copper">
              Pack Leaders
            </h1>
            <p className="text-lg text-mystic-steam-parchment/60 font-body">
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
            <div className="steel-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-heading font-bold text-mystic-steam-copper">
                {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : data?.stats.totalTokens || 0}
              </div>
              <div className="text-sm text-mystic-steam-parchment/60 font-body mt-1">Tokens Summoned</div>
            </div>
            <div className="steel-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-heading font-bold text-mystic-steam-copper">
                {isLoading ? <Skeleton className="h-9 w-16 mx-auto" /> : data?.stats.totalCreators || 0}
              </div>
              <div className="text-sm text-mystic-steam-parchment/60 font-body mt-1">Pack Members</div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="steel-panel rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-mystic-steam-copper/20">
              <h2 className="font-heading font-bold text-xl text-mystic-steam-copper">Top Creators</h2>
            </div>

            <div className="divide-y divide-mystic-steam-copper/10">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </div>
                ))
              ) : data?.leaderboard.length === 0 ? (
                <div className="px-6 py-12 text-center text-mystic-steam-parchment/50 font-body">
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
                      className="flex items-center gap-4 px-6 py-4 hover:bg-dacian-steel-dark transition-colors"
                    >
                      {/* Rank with Sigil */}
                      <div className={`flex items-center gap-2 ${badge.color}`}>
                        {badge.Sigil && (
                          <badge.Sigil className="w-5 h-5 animate-pulse" />
                        )}
                        <span className="font-heading font-bold text-sm">
                          #{entry.rank}
                        </span>
                      </div>

                      {/* Wallet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://solscan.io/account/${entry.wallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-mystic-steam-parchment hover:text-mystic-steam-copper transition-colors"
                          >
                            {truncateWallet(entry.wallet)}
                          </a>
                          {badge.label && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold bg-${badge.color.replace('text-', '')}/20 ${badge.color} rounded border border-current/30`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        {entry.latestToken && (
                          <Link
                            href={`/token/${entry.latestToken.mint}`}
                            className="text-xs text-mystic-steam-parchment/50 hover:text-mystic-steam-parchment/70 transition-colors"
                          >
                            Latest: ${entry.latestToken.symbol}
                          </Link>
                        )}
                      </div>

                      {/* Tokens Created */}
                      <div className="text-right">
                        <div className="font-heading font-bold text-mystic-steam-parchment">
                          {entry.tokensCreated}
                        </div>
                        <div className="text-xs text-mystic-steam-parchment/50 font-body">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-mystic-steam-copper/80 hover:bg-mystic-steam-copper text-mystic-steam-parchment font-heading font-bold rounded-lg transition-all"
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
