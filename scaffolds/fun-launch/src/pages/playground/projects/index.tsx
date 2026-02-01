'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';

type Project = {
  id: string;
  title: string;
  description: string | null;
  authorWallet: string | null;
  authorLabel: string | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  thumbnail: string | null;
  language: string | null;
};

type ProjectsResponse = {
  success: boolean;
  projects: Project[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

function useProjects(sortBy: string, sortOrder: string) {
  return useQuery<ProjectsResponse>({
    queryKey: ['projects', sortBy, sortOrder],
    queryFn: async () => {
      const res = await fetch(`/api/projects?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function PlaygroundProjectsPage() {
  const [sortBy, setSortBy] = useState<'createdAt' | 'voteCount'>('voteCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading } = useProjects(sortBy, sortOrder);

  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-[var(--tech-accent)]">
              Contest Projects
            </h1>
            <p className="text-lg text-[var(--text-muted)] font-body">
              Deploy from the IDE and collect votes. One vote per project per identity.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Link
                href="/ide"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--tech-accent)]/20 border border-[var(--tech-accent)]/30 text-[var(--tech-accent)] font-body font-medium hover:bg-[var(--tech-accent)]/30 transition-colors"
              >
                Open IDE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-sm text-[var(--text-muted)] font-body">Sort:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy('voteCount');
                setSortOrder('desc');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                sortBy === 'voteCount'
                  ? 'bg-[var(--tech-accent)]/20 text-[var(--tech-accent)] border border-[var(--tech-accent)]/30'
                  : 'bg-[var(--tech-surface-elevated)] border border-[var(--tech-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Most votes
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                sortBy === 'createdAt'
                  ? 'bg-[var(--tech-accent)]/20 text-[var(--tech-accent)] border border-[var(--tech-accent)]/30'
                  : 'bg-[var(--tech-surface-elevated)] border border-[var(--tech-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Newest
            </button>
          </motion.div>

          <div className="grid gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--tech-border-elevated)] bg-[var(--tech-surface-elevated)] p-4 flex items-center gap-4"
                  >
                    <Skeleton className="h-16 w-24 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))
              : data?.projects.length === 0
                ? (
                  <div className="rounded-xl border border-[var(--tech-border-elevated)] bg-[var(--tech-surface-elevated)] p-12 text-center text-[var(--text-muted)] font-body">
                    No projects yet. Create one in the IDE and deploy.
                  </div>
                )
                : data?.projects.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/playground/projects/${p.id}`}
                      className="block rounded-xl border border-[var(--tech-border-elevated)] bg-[var(--tech-surface-elevated)] p-4 hover:border-[var(--tech-accent)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-24 rounded-lg bg-[var(--tech-surface)] border border-[var(--tech-border)] shrink-0 overflow-hidden flex items-center justify-center">
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[var(--text-muted)] text-xs font-mono">preview</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-heading font-bold text-[var(--text-primary)] truncate">
                            {p.title}
                          </h2>
                          <p className="text-sm text-[var(--text-muted)] truncate">
                            {p.authorLabel || (p.authorWallet ? `${p.authorWallet.slice(0, 6)}...${p.authorWallet.slice(-4)}` : 'Anonymous')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-body text-[var(--text-muted)]">
                            {p.voteCount} vote{p.voteCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatDate(p.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
