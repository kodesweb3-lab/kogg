'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';
import { useLocalTokens } from '@/hooks/useLocalTokens';
import Page from '@/components/ui/Page/Page';
import { LayoutSection } from '@/components/ui/LayoutSection';
import { shortenAddress } from '@/lib/utils';

const features = [
  { title: 'Non-custodial', desc: 'Your keys, your tokens. Always.', icon: '🔒' },
  { title: 'Instant', desc: 'Launch in under 60 seconds.', icon: '⚡' },
  { title: 'Agent-ready', desc: 'Full API for autonomous agents.', icon: '🤖' },
  { title: 'No retained supply', desc: 'You keep 100% of your tokens.', icon: '🛡' },
];

function StatsCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const target = parseInt(value.replace(/,/g, '').replace(/\+/g, '')) || 0;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(Math.floor(current));
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    const el = document.getElementById(`stat-${value}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  return <span id={`stat-${value}`}>{count.toLocaleString()}</span>;
}

export default function LandingPage() {
  const { setShowModal } = useUnifiedWalletContext();
  const { connected } = useWallet();
  const router = useRouter();
  const { data: recentTokensData } = useLocalTokens({ page: 1, limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
  const recentTokens = recentTokensData?.data || [];
  const totalTokensLaunched = recentTokensData?.pagination?.total ?? 0;
  const hasWallet = connected;

  return (
    <Page>
      <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 text-[var(--text-primary)] pb-6">

        {/* ── Hero ── */}
        <section className="relative pt-10 sm:pt-16 md:pt-24 pb-12 sm:pb-16 md:pb-20 min-h-[85vh] flex items-center">
          {/* Subtle gradient mesh background (no glowing blobs) */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none mesh-bg" />

          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent-purple)]/20 bg-[var(--accent-purple)]/5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent-emerald)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-emerald)]" />
                </span>
                <span className="text-xs font-medium text-[var(--accent-purple)]">Live on Solana Mainnet</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight mb-6"
            >
              <span className="gradient-text">Kogaion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] mb-4 font-heading"
            >
              The <span className="text-[var(--accent-emerald)]">Agent Economy</span> Launchpad
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed"
            >
              Launch tokens, build projects, and create the decentralized economy. Powered by Solana and Meteora DBC.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3 sm:gap-4 justify-center"
            >
              <Button variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-[160px]" onClick={() => router.push('/discover')}>
                Explore Tokens
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[160px]" onClick={() => router.push('/create-pool')}>
                Launch Token
              </Button>
              {!hasWallet && (
                <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
                  Connect Wallet
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tokens Launched', value: String(totalTokensLaunched), isCounter: true },
            { label: 'Agent-ready', value: 'API & Skills', isCounter: false },
            { label: 'Creator Fee', value: '1.65%', isCounter: false },
            { label: 'Uptime', value: '24/7', isCounter: false },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-5 text-center card-hover elevation-1"
              style={{ background: 'var(--gradient-card)' }}
            >
              <div className="text-2xl md:text-3xl font-bold font-heading gradient-text mb-1">
                {stat.isCounter ? <StatsCounter value={stat.value} /> : stat.value}
              </div>
              <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        {/* ── Features Grid ── */}
        <section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-layer)] p-6 card-hover elevation-1"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1 font-heading text-sm">{f.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Why Kogaion ── */}
        <LayoutSection title="Why launch on Kogaion" description="Better economics and full control for creators." gap="default" variant="default">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 md:p-8 glow-card" style={{ background: 'var(--gradient-card)' }}>
              <div className="text-3xl mb-4 gradient-text font-heading font-bold">1.65%</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-heading">Creator fee share</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Creators earn <strong className="text-[var(--accent)]">1.65%</strong> on every buy and sell -- compared with 0.3% to 0.9% on other platforms.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 md:p-8 glow-card" style={{ background: 'var(--gradient-card)' }}>
              <div className="text-3xl mb-4 gradient-text font-heading font-bold">0%</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 font-heading">No retained supply</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Other platforms keep up to <strong>20%</strong> of your supply. Kogaion keeps <strong className="text-[var(--accent)]">none</strong> -- you own 100% of what you create.
              </p>
            </div>
          </div>
        </LayoutSection>

        {/* ── Recent Launches ── */}
        <LayoutSection gap="default" variant="default">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Recent Launches</h2>
            <Link href="/discover" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View all →
            </Link>
          </div>
          {recentTokens.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTokens.slice(0, 6).map((token, i) => (
                <motion.div
                  key={token.mint}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/token/${token.mint}`}
                    className="flex items-center gap-4 rounded-[var(--radius-md)] p-4 border border-[var(--border-default)] bg-[var(--bg-layer)] hover:border-[var(--accent)]/20 hover:shadow-glow-sm transition-all"
                  >
                    {token.imageUrl ? (
                      <img src={token.imageUrl} alt="" className="w-12 h-12 rounded-[var(--radius-sm)] object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center text-lg font-bold gradient-text" style={{ background: 'var(--gradient-card)' }}>
                        {token.symbol?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[var(--text-primary)] truncate">{token.name}</div>
                      <div className="text-xs font-mono text-[var(--text-muted)] truncate">{shortenAddress(token.mint)}</div>
                    </div>
                    <span className="text-[var(--accent)] text-sm">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] p-16 border border-[var(--border-default)] text-center" style={{ background: 'var(--gradient-card)' }}>
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-[var(--text-muted)] mb-6">No tokens launched yet. Be the first!</p>
              <Button variant="primary" size="lg" onClick={() => router.push('/create-pool')}>
                Launch Now
              </Button>
            </div>
          )}
        </LayoutSection>

        {/* ── CTA ── */}
        <section
          className="rounded-[var(--radius-xl)] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'var(--gradient-card)' }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-[var(--radius-xl)] p-[1px]" style={{ background: 'var(--gradient-border)' }}>
            <div className="w-full h-full rounded-[var(--radius-xl)]" style={{ background: 'var(--bg-layer)' }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[var(--text-primary)] mb-3">Ready to Launch?</h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
              Join the agent economy. Launch your token in minutes with zero code required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-[160px]" onClick={() => router.push('/create-pool')}>
                Launch Token
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[140px]" onClick={() => router.push('/for-agents')}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* ── Quick Links ── */}
        <section className="py-8 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'For Agents', icon: '🤖', desc: 'API & skills', href: '/for-agents' },
              { name: 'IDE', icon: '💻', desc: 'Build projects', href: '/ide' },
              { name: 'Playground', icon: '🎮', desc: 'Chat with agents', href: '/agents-playground' },
              { name: 'Marketplace', icon: '🏪', desc: 'Service providers', href: '/service-providers' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-5 rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</div>
                <div className="font-semibold text-sm text-[var(--text-primary)] font-heading">{link.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
