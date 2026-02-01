'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { ServiceProviderCard } from '@/components/ServiceProvider/ServiceProviderCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { PREDEFINED_TAGS } from '@/lib/service-provider-tags';
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
  createdAt: string;
}

interface ServiceProvidersResponse {
  success: boolean;
  providers: ServiceProvider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ServiceProvidersMarketplacePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const { data, isLoading, error } = useQuery<ServiceProvidersResponse>({
    queryKey: ['service-providers', page, selectedTag, searchQuery, showVerifiedOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (showVerifiedOnly) {
        params.append('verified', 'true');
      }

      const response = await fetch(`/api/service-providers?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service providers');
      }
      return response.json();
    },
  });

  return (
    <Page>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-heading font-bold text-mystic-steam-copper mb-2">
                  Service Providers Marketplace
                </h1>
                <p className="text-mystic-steam-parchment/70">
                  Connect with KOLs, marketers, moderators, and other service providers in the
                  Solana ecosystem.
                </p>
              </div>
              <Button
                onClick={() => router.push('/service-providers/register')}
                variant="steel"
                className="w-full md:w-auto"
              >
                Register as Provider
              </Button>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 steel-panel rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search providers..."
                  className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                />
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                  Filter by Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                >
                  <option value="">All Tags</option>
                  {PREDEFINED_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Filter */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => {
                      setShowVerifiedOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded border-dacian-steel-steel bg-dacian-steel-gunmetal text-dacian-steel-copper focus:ring-dacian-steel-copper"
                  />
                  <span className="text-sm text-mystic-steam-parchment/70">
                    Verified only
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mystic-steam-copper"></div>
              <p className="text-mystic-steam-parchment/60 mt-4">Loading providers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 steel-panel rounded-xl">
              <p className="text-mystic-steam-parchment/70">Failed to load service providers.</p>
            </div>
          ) : !data || data.providers.length === 0 ? (
            <div className="text-center py-12 steel-panel rounded-xl">
              <p className="text-mystic-steam-parchment/70 mb-4">No service providers found.</p>
              <Button onClick={() => router.push('/service-providers/register')}>
                Be the first to register
              </Button>
            </div>
          ) : (
            <>
              {/* Premium Table Layout */}
              <div className="steel-panel rounded-xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dacian-steel-gunmetal/50 border-b border-dacian-steel-steel/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-heading font-bold text-mystic-steam-copper uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-heading font-bold text-mystic-steam-copper uppercase tracking-wider">
                          Services
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-heading font-bold text-mystic-steam-copper uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-heading font-bold text-mystic-steam-copper uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-heading font-bold text-mystic-steam-copper uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dacian-steel-steel/20">
                      {data.providers.map((provider, index) => (
                        <motion.tr
                          key={provider.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-dacian-steel-gunmetal/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-mystic-steam-parchment">
                                  {provider.wallet.slice(0, 4)}...{provider.wallet.slice(-4)}
                                </span>
                                {provider.verified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                              {provider.twitterHandle && (
                                <Link
                                  href={`https://x.com/${provider.twitterHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-dacian-steel-copper hover:text-dacian-steel-copper-light mt-1"
                                >
                                  @{provider.twitterHandle}
                                </Link>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {provider.description && (
                                <p className="text-sm text-mystic-steam-parchment/80 line-clamp-2 max-w-md">
                                  {provider.description}
                                </p>
                              )}
                              {provider.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {provider.tags.slice(0, 4).map((tagItem) => (
                                    <span
                                      key={tagItem.tag}
                                      className="px-2 py-0.5 bg-dacian-steel-steel/50 text-mystic-steam-parchment/70 rounded text-xs border border-dacian-steel-steel/30"
                                    >
                                      {tagItem.tag}
                                    </span>
                                  ))}
                                  {provider.tags.length > 4 && (
                                    <span className="px-2 py-0.5 text-mystic-steam-parchment/50 text-xs">
                                      +{provider.tags.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {provider.telegram && (
                                <Link
                                  href={`https://t.me/${provider.telegram.replace(/^@/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors border border-dacian-steel-steel/30"
                                >
                                  Telegram
                                </Link>
                              )}
                              {provider.twitterHandle && (
                                <Link
                                  href={`https://x.com/${provider.twitterHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors border border-dacian-steel-steel/30"
                                >
                                  Twitter
                                </Link>
                              )}
                              {provider.email && (
                                <a
                                  href={`mailto:${provider.email}`}
                                  className="px-3 py-1.5 bg-dacian-steel-gunmetal hover:bg-dacian-steel-steel text-mystic-steam-parchment rounded text-xs transition-colors border border-dacian-steel-steel/30"
                                >
                                  Email
                                </a>
                              )}
                              {!provider.telegram && !provider.twitterHandle && !provider.email && (
                                <span className="text-xs text-mystic-steam-parchment/50">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {provider.verified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30 w-fit">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30 w-fit">
                                  Pending
                                </span>
                              )}
                              <span className="text-xs text-mystic-steam-parchment/50">
                                {new Date(provider.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {(provider.telegram || provider.twitterHandle || provider.email) && (
                                <button
                                  onClick={() => {
                                    if (provider.telegram) {
                                      window.open(`https://t.me/${provider.telegram.replace(/^@/, '')}`, '_blank');
                                    } else if (provider.twitterHandle) {
                                      window.open(`https://x.com/${provider.twitterHandle}`, '_blank');
                                    } else if (provider.email) {
                                      window.location.href = `mailto:${provider.email}`;
                                    }
                                  }}
                                  className="px-4 py-2 bg-mystic-steam-copper/80 hover:bg-mystic-steam-copper text-mystic-steam-parchment rounded text-xs font-medium transition-colors"
                                >
                                  Contact
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-mystic-steam-parchment/70">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
