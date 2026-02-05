import { useLocalTokens } from '@/hooks/useLocalTokens';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Skeleton } from '../ui/Skeleton';

export function LiveFeed() {
  const { data, status } = useLocalTokens({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const tokens = data?.data || [];

  return (
    <div className="bg-[var(--bg-layer)] rounded-xl border border-[var(--border-default)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
          </span>
          <h3 className="font-heading font-bold text-[var(--accent)]">Live Rituals</h3>
        </div>
        <Link 
          href="/discover" 
          className="text-sm text-[var(--text-primary)]/60 hover:text-[var(--text-primary)] transition-colors font-body"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[var(--border-default)]">
        {status === 'pending' ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : tokens.length === 0 ? (
          <div className="px-4 py-8 text-center text-[var(--text-primary)]/50 font-body">
            No tokens launched yet. Be the first!
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tokens.map((token, index) => (
              <motion.div
                key={token.mint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/token/${token.mint}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  {/* Token Image */}
                  <div className="relative">
                    {token.imageUrl ? (
                      <img
                        src={token.imageUrl}
                        alt={token.symbol}
                        className="h-10 w-10 rounded-full object-cover border border-[var(--border-default)]"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent)] font-bold">
                        {token.symbol?.charAt(0) || '?'}
                      </div>
                    )}
                    {/* New badge for very recent tokens */}
                    {isNew(token.createdAt) && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold bg-[var(--accent)] text-[var(--text-primary)] rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-[var(--text-primary)] truncate">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-[var(--text-primary)]/50 truncate font-body">
                        {token.name}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-primary)]/60 font-body">
                      {formatTimeAgo(token.createdAt)}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-[var(--text-primary)]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function isNew(dateStr: string | Date): boolean {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = diffMs / (1000 * 60);
  return diffMins < 10; // Less than 10 minutes
}

function formatTimeAgo(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default LiveFeed;
