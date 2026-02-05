'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ServiceProvider {
  id: string;
  wallet: string;
  email?: string | null;
  telegram?: string | null;
  twitterHandle?: string | null;
  description?: string | null;
  verified: boolean;
  tags: Array<{ tag: string; isCustom: boolean }>;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const truncateWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 hover:border-[var(--border-default)] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-[var(--text-muted)]">
              {truncateWallet(provider.wallet)}
            </span>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                ✓ Verified
              </span>
            )}
          </div>
          {provider.twitterHandle && (
            <Link
              href={`https://x.com/${provider.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:opacity-90 text-sm"
            >
              @{provider.twitterHandle}
            </Link>
          )}
        </div>
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">
          {provider.description}
        </p>
      )}

      {/* Tags */}
      {provider.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {provider.tags.slice(0, 5).map((tagItem) => (
            <span
              key={tagItem.tag}
              className="px-2 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded text-xs"
            >
              {tagItem.tag}
            </span>
          ))}
          {provider.tags.length > 5 && (
            <span className="px-2 py-1 text-[var(--text-muted)] text-xs">
              +{provider.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Contact Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border-default)]">
        {provider.telegram && (
          <Link
            href={`https://t.me/${provider.telegram.replace(/^@/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-layer)] text-[var(--text-primary)] rounded text-xs transition-colors"
          >
            Telegram
          </Link>
        )}
        {provider.twitterHandle && (
          <Link
            href={`https://x.com/${provider.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-layer)] text-[var(--text-primary)] rounded text-xs transition-colors"
          >
            Twitter
          </Link>
        )}
        {provider.email && (
          <a
            href={`mailto:${provider.email}`}
            className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-layer)] text-[var(--text-primary)] rounded text-xs transition-colors"
          >
            Email
          </a>
        )}
      </div>
    </motion.div>
  );
}
