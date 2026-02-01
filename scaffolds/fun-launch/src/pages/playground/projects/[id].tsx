'use client';

import { useRouter } from 'next/router';
import { useMemo, useEffect, useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Page from '@/components/ui/Page/Page';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';

const VOTER_FP_KEY = 'kogaion_voter_fp';

function getVoterFingerprint(): string {
  if (typeof window === 'undefined') return '';
  let fp = localStorage.getItem(VOTER_FP_KEY);
  if (!fp) {
    fp = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(VOTER_FP_KEY, fp);
  }
  return fp;
}

type ProjectDetail = {
  id: string;
  title: string;
  description: string | null;
  html: string | null;
  css: string | null;
  js: string | null;
  python: string | null;
  authorWallet: string | null;
  authorLabel: string | null;
  language: string | null;
  thumbnail: string | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  voted: boolean;
};

type ProjectResponse = {
  success: boolean;
  project: ProjectDetail;
};

function buildPreviewDoc(html: string | null, css: string | null, js: string | null): string {
  const h = (html || '').trim() || '<div></div>';
  const c = (css || '').trim();
  const j = (js || '').trim();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${c}</style></head><body>${h}${j ? `<script>${j}</script>` : ''}</body></html>`;
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

export default function PlaygroundProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const wallet = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const [voterFingerprint, setVoterFingerprint] = useState('');
  useEffect(() => {
    setVoterFingerprint(getVoterFingerprint());
  }, []);

  const voterParams = useMemo(() => {
    if (wallet) return { voterWallet: wallet };
    if (voterFingerprint) return { voterFingerprint: voterFingerprint };
    return {};
  }, [wallet, voterFingerprint]);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (wallet) p.set('voterWallet', wallet);
    else if (voterFingerprint) p.set('voterFingerprint', voterFingerprint);
    return p.toString();
  }, [wallet, voterFingerprint]);

  const { data, isLoading } = useQuery<ProjectResponse>({
    queryKey: ['project', id, queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}?${queryParams}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Project not found');
        throw new Error('Failed to fetch project');
      }
      return res.json();
    },
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      const body = wallet
        ? { voterWallet: wallet }
        : { voterFingerprint: voterFingerprint, voterLabel: 'Anonymous' };
      const res = await fetch(`/api/projects/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Failed to vote');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id, queryParams] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: async () => {
      const body = wallet
        ? { voterWallet: wallet }
        : { voterFingerprint: voterFingerprint };
      const res = await fetch(`/api/projects/${id}/vote`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to remove vote');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id, queryParams] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const project = data?.project;
  const voted = project?.voted ?? false;
  const voteCount = project?.voteCount ?? 0;
  const srcdoc = project
    ? buildPreviewDoc(project.html, project.css, project.js)
    : '';

  if (!id) return null;

  if (isLoading || !project) {
    return (
      <Page>
        <div className="min-h-screen text-[var(--text-primary)] py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/playground/projects"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--tech-accent)] font-body mb-4 inline-block"
            >
              ← Back to projects
            </Link>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-[var(--text-primary)] mb-2">
              {project.title}
            </h1>
            <p className="text-[var(--text-muted)] font-body text-sm">
              {project.authorLabel || (project.authorWallet ? `${project.authorWallet.slice(0, 8)}...${project.authorWallet.slice(-4)}` : 'Anonymous')}
              {' · '}
              {formatDate(project.createdAt)}
            </p>
            {project.description && (
              <p className="text-[var(--text-muted)] font-body mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[var(--tech-border-elevated)] bg-[var(--tech-surface-elevated)] overflow-hidden mb-6"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--tech-border)] bg-[var(--tech-surface)]">
              <span className="text-xs font-mono text-[var(--text-muted)]">Preview</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-body text-[var(--text-muted)]">
                  {voteCount} vote{voteCount !== 1 ? 's' : ''}
                </span>
                {voted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unvoteMutation.isPending}
                    onClick={() => unvoteMutation.mutate()}
                    className="text-xs"
                  >
                    {unvoteMutation.isPending ? 'Removing…' : 'Voted ✓'}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    disabled={voteMutation.isPending}
                    onClick={() => voteMutation.mutate()}
                    className="text-xs bg-[var(--tech-accent)]/20 border-[var(--tech-accent)]/30 text-[var(--tech-accent)] hover:bg-[var(--tech-accent)]/30"
                  >
                    {voteMutation.isPending ? 'Voting…' : 'Vote'}
                  </Button>
                )}
              </div>
            </div>
            <div className="aspect-video min-h-[320px] bg-[var(--tech-bg)]">
              <iframe
                title="Project preview"
                srcDoc={srcdoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/ide"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--tech-surface-elevated)] border border-[var(--tech-border-elevated)] text-[var(--text-primary)] font-body text-sm hover:border-[var(--tech-accent)] transition-colors"
            >
              Open IDE
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/playground/projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--tech-border-elevated)] text-[var(--text-muted)] font-body text-sm hover:text-[var(--text-primary)] transition-colors"
            >
              All projects
            </Link>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
