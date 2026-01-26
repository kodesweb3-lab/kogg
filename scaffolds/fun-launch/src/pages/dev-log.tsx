import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface DevLogEntry {
  id: string;
  title: string;
  content: string;
  category: 'UPDATE' | 'FIX' | 'ANNOUNCEMENT' | 'ROADMAP' | 'TECHNICAL';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'BLOCKED';
  version?: string | null;
  publishedAt: string;
  createdAt: string;
}

interface DevLogResponse {
  success: boolean;
  data: DevLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const categoryColors = {
  UPDATE: 'bg-mystic-steam-copper/20 text-mystic-steam-copper border-mystic-steam-copper/30',
  FIX: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ANNOUNCEMENT: 'bg-mystic-steam-gold/20 text-mystic-steam-gold border-mystic-steam-gold/30',
  ROADMAP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  TECHNICAL: 'bg-mystic-steam-bronze/20 text-mystic-steam-bronze border-mystic-steam-bronze/30',
};

const statusColors = {
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PLANNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons = {
  COMPLETED: '✅',
  IN_PROGRESS: '🔄',
  PLANNED: '📋',
  BLOCKED: '⛔',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function DevLogCard({ entry }: { entry: DevLogEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="steel-panel rounded-xl p-6 md:p-8 relative overflow-hidden"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-heading font-bold mb-2 text-mystic-steam-copper">
              {entry.title}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className={`px-3 py-1 text-xs font-heading font-bold rounded-full border ${categoryColors[entry.category]}`}
              >
                {entry.category}
              </span>
              <span
                className={`px-3 py-1 text-xs font-heading font-bold rounded-full border ${statusColors[entry.status]}`}
              >
                {statusIcons[entry.status]} {entry.status.replace('_', ' ')}
              </span>
              {entry.version && (
                <span className="px-3 py-1 text-xs font-mono text-mystic-steam-parchment/60 bg-dacian-steel-gunmetal rounded-full border border-mystic-steam-copper/20">
                  {entry.version}
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-mystic-steam-parchment/50 font-body">
            {formatDate(entry.publishedAt)}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-mystic-steam-parchment/80 font-body leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DevLogPage() {
  const [filter, setFilter] = useState<'ALL' | DevLogEntry['category']>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DevLogEntry['status']>('ALL');

  const { data, isLoading, error } = useQuery<DevLogResponse>({
    queryKey: ['dev-logs', filter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('category', filter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      params.append('limit', '50');
      
      const res = await fetch(`/api/dev-log?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch dev logs');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const entries = data?.data || [];

  // Group entries by status for summary
  const completed = entries.filter((e) => e.status === 'COMPLETED').length;
  const inProgress = entries.filter((e) => e.status === 'IN_PROGRESS').length;
  const planned = entries.filter((e) => e.status === 'PLANNED').length;

  return (
    <Page>
      <div className="min-h-screen text-mystic-steam-parchment py-12 md:py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-mystic-steam-copper">
              Dev Log
            </h1>
            <p className="text-xl md:text-2xl text-mystic-steam-parchment/70 font-body max-w-3xl mx-auto">
              Building the future of Solana launchpads. Track our progress, updates, and what's coming next.
            </p>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="steel-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-heading font-bold text-green-400 mb-2">{completed}</div>
              <div className="text-sm text-mystic-steam-parchment/60 font-body">Completed</div>
            </div>
            <div className="steel-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-heading font-bold text-yellow-400 mb-2">{inProgress}</div>
              <div className="text-sm text-mystic-steam-parchment/60 font-body">In Progress</div>
            </div>
            <div className="steel-panel rounded-xl p-6 text-center">
              <div className="text-3xl font-heading font-bold text-blue-400 mb-2">{planned}</div>
              <div className="text-sm text-mystic-steam-parchment/60 font-body">Planned</div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-body font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-mystic-steam-copper/30 text-mystic-steam-copper border border-mystic-steam-copper/50'
                  : 'bg-dacian-steel-gunmetal text-mystic-steam-parchment/70 hover:bg-dacian-steel-steel border border-mystic-steam-copper/20'
              }`}
            >
              All Categories
            </button>
            {(['UPDATE', 'FIX', 'ANNOUNCEMENT', 'ROADMAP', 'TECHNICAL'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-body font-medium transition-colors ${
                  filter === cat
                    ? `${categoryColors[cat]} border-2`
                    : 'bg-dacian-steel-gunmetal text-mystic-steam-parchment/70 hover:bg-dacian-steel-steel border border-mystic-steam-copper/20'
                }`}
              >
                {cat}
              </button>
            ))}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 rounded-lg font-body font-medium bg-dacian-steel-gunmetal text-mystic-steam-parchment border border-mystic-steam-copper/20 hover:bg-dacian-steel-steel transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PLANNED">Planned</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </motion.div>

          {/* Vision Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="steel-panel rounded-2xl p-8 md:p-12 mb-12 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-mystic-steam-copper">
                The Direction
              </h2>
              <div className="space-y-4 text-lg font-body leading-relaxed text-mystic-steam-parchment/70">
                <p>
                  <strong className="text-mystic-steam-copper">Kogaion</strong> is evolving into the most comprehensive and secure launchpad on Solana. We're building beyond just token launches—we're creating an ecosystem.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-dacian-steel-gunmetal/50 rounded-lg p-4 border border-mystic-steam-copper/20">
                    <h3 className="font-heading font-bold text-mystic-steam-copper mb-2">Genesis SDK Integration</h3>
                    <p className="text-sm text-mystic-steam-parchment/60">
                      Anti-rug protection, standardized tokenomics, and enhanced security for all launches.
                    </p>
                  </div>
                  <div className="bg-dacian-steel-gunmetal/50 rounded-lg p-4 border border-mystic-steam-copper/20">
                    <h3 className="font-heading font-bold text-mystic-steam-copper mb-2">AI & Automation</h3>
                    <p className="text-sm text-mystic-steam-parchment/60">
                      Autonomous AI agents, smart contract automation, and intelligent market analysis.
                    </p>
                  </div>
                  <div className="bg-dacian-steel-gunmetal/50 rounded-lg p-4 border border-mystic-steam-copper/20">
                    <h3 className="font-heading font-bold text-mystic-steam-copper mb-2">Real World Assets</h3>
                    <p className="text-sm text-mystic-steam-parchment/60">
                      Tokenize products, services, and assets. Beyond memecoins, into real value.
                    </p>
                  </div>
                  <div className="bg-dacian-steel-gunmetal/50 rounded-lg p-4 border border-mystic-steam-copper/20">
                    <h3 className="font-heading font-bold text-mystic-steam-copper mb-2">Service Marketplace</h3>
                    <p className="text-sm text-mystic-steam-parchment/60">
                      Connect with KOLs, marketers, moderators, and service providers. Build your pack.
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-mystic-steam-parchment/80">
                  We're committed to giving developers more than any other platform. Higher fees, better tools, and a complete ecosystem to build on.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dev Log Entries */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex gap-2">
                <div className="w-2 h-2 bg-mystic-steam-copper rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-mystic-steam-copper rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-mystic-steam-copper rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-mystic-steam-parchment/60 font-body mt-4">Loading updates...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 font-body">Failed to load dev logs. Please try again later.</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-mystic-steam-parchment/60 font-body">No entries found. Check back soon for updates!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <DevLogCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="steel-panel rounded-xl p-8">
              <h3 className="text-2xl font-heading font-bold mb-4 text-mystic-steam-copper">
                Join the Pack
              </h3>
              <p className="text-mystic-steam-parchment/70 font-body mb-6 max-w-2xl mx-auto">
                Follow our progress, launch your tokens, and be part of the evolution. The future of Solana launchpads is being built here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://x.com/KogaionSol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-mystic-steam-copper/80 hover:bg-mystic-steam-copper text-mystic-steam-parchment font-heading font-bold rounded-lg transition-all"
                >
                  Follow on X
                </a>
                <a
                  href="https://t.me/kogaionpack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment font-heading font-bold rounded-lg border border-mystic-steam-copper/30 transition-all"
                >
                  Join Telegram
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
