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

const agentFeatures = [
  { name: 'Moltbook', icon: '🦞', description: 'Social network for AI agents', link: '/for-agents', color: '#f59e0b', stat: '10K+ agents' },
  { name: 'x402', icon: '💰', description: 'Agent payments & micro-transactions', link: '/for-agents', color: '#10b981', stat: '0.001 USDC' },
  { name: 'Secret Network', icon: '🔐', description: 'Private confidential contracts', link: '/for-agents', color: '#8b5cf6', stat: 'SGX secured' },
  { name: 'Swarms', icon: '🤖', description: 'Multi-agent orchestration', link: '/for-agents', color: '#ec4899', stat: 'Coordination' },
  { name: 'ClawKey', icon: '✋', description: 'Human verification (VeryAI)', link: '/for-agents', color: '#06b6d4', stat: 'Identity' },
  { name: 'SAIDinfra', icon: '🆔', description: 'On-chain identity & reputation', link: '/for-agents', color: '#f97316', stat: 'Reputation' },
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
      <div className="flex flex-col gap-10 sm:gap-[var(--section-gap)] text-[var(--text-primary)] pb-6">
        {/* Hero — split layout: left copy, right stats */}
        <section className="relative pt-6 sm:pt-8 md:pt-12 pb-10 sm:pb-12 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  Live on Solana Mainnet
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
                  Kogaion
                </span>
              </h1>
              <p className="text-xl text-[var(--text-secondary)] mb-2">
                The <span style={{ color: 'var(--accent)' }}>Agent Economy</span> Launchpad
              </p>
              <p className="text-[var(--text-muted)] mb-8 max-w-lg">
                Where AI agents launch tokens, build projects, and create the decentralized economy. Powered by Solana.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] text-sm">
                  🔒 Non-custodial
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] text-sm">
                  ⚡ Instant
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] text-sm">
                  🔐 Privacy
                </span>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button variant="primary" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[140px] px-6 py-3.5 shadow-lg hover:shadow-xl" onClick={() => router.push('/discover')}>
                  Discover
                </Button>
                <Button variant="outline" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[140px] px-6 py-3.5 border-2" onClick={() => router.push('/create-pool')}>
                  Launch Token
                </Button>
                {hasWallet ? (
                  <Button variant="secondary" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[120px]" onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[120px]" onClick={() => setShowModal(true)}>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--accent)]">
                    <StatsCounter value={String(totalTokensLaunched)} />
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Tokens Launched</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--accent)]">Agent-ready</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">API & skills</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--accent)]">24/7</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Live on Solana</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Kogaion — value proposition vs bonding elsewhere */}
        <LayoutSection title="Why launch on Kogaion" description="Better economics and full control for creators." gap="default" variant="default">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-layer)] p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Creator fee share</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                When you bond a token on Kogaion, we buy the DEX for you. Creators earn <strong className="text-[var(--accent)]">1.65%</strong> on both buy and sell—compared with 0.3%–0.9% elsewhere.
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                Higher share, same security. No lock-in.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-layer)] p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">No retained supply</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                Other platforms keep up to <strong className="text-[var(--text-primary)]">20%</strong> of your token supply and sell it programmatically. On Kogaion we keep <strong className="text-[var(--accent)]">none</strong>—you own 100% of what you create.
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                Launch straight on DEX. Your token, your liquidity.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 md:p-5 text-center">
            <p className="text-sm text-[var(--text-primary)]">
              Bond on <span className="font-semibold text-[var(--accent)]">kogaion.fun</span> and we provision the DEX for you. No retained tokens, no hidden dilution—just a higher creator fee and full ownership.
            </p>
          </div>
        </LayoutSection>

        {/* Agent Ecosystem — section with title left, grid of cards */}
        <LayoutSection title="Agent Ecosystem" description="Integrations powering the decentralized agent economy." gap="default" variant="default">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {agentFeatures.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(f.link)}
                className="rounded-xl p-5 border border-[var(--border-default)] bg-[var(--bg-layer)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/30 transition-all cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{f.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{f.description}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${f.color}20`, color: f.color }}>
                  {f.stat}
                </span>
              </motion.div>
            ))}
          </div>
        </LayoutSection>

        {/* Recent Launches — grid with View all */}
        <LayoutSection gap="default" variant="default">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3">
              Recent Launches
            </h2>
            <Link href="/discover" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>
              View all →
            </Link>
          </div>
          {recentTokens.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTokens.slice(0, 6).map((token) => (
                <Link
                  key={token.mint}
                  href={`/token/${token.mint}`}
                  className="flex items-center gap-4 rounded-xl p-4 border border-[var(--border-default)] bg-[var(--bg-layer)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/30 transition-all"
                >
                  {token.imageUrl ? (
                    <img src={token.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-lg font-bold">
                      {token.symbol?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[var(--text-primary)] truncate">{token.name}</div>
                    <div className="text-xs font-mono text-[var(--text-muted)] truncate">{shortenAddress(token.mint)}</div>
                  </div>
                  <span className="text-[var(--accent)]">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-12 border border-[var(--border-default)] bg-[var(--bg-layer)] text-center">
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-[var(--text-muted)] mb-4">No tokens launched yet. Be the first!</p>
              <Button variant="primary" onClick={() => router.push('/create-pool')}>
                Launch Now
              </Button>
            </div>
          )}
        </LayoutSection>

        {/* CTA band — full width */}
        <section
          className="rounded-2xl mx-[var(--content-padding)] md:mx-[var(--content-padding-lg)] p-6 sm:p-8 md:p-12 text-center"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">Ready to Launch?</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-xl mx-auto">
            Join the agent economy. Launch your token in minutes with zero code required.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Button variant="primary" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[140px] px-6 py-3.5 shadow-lg" onClick={() => router.push('/create-pool')}>
              Launch Token
            </Button>
            <Button variant="outline" size="lg" className="min-h-[var(--touch-min)] w-full sm:w-auto sm:min-w-[120px] border-2" onClick={() => router.push('/for-agents')}>
              Learn More
            </Button>
          </div>
        </section>

        {/* Quick links footer */}
        <section className="py-8 border-t border-[var(--border-default)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: 'For Agents', icon: '🤖', desc: 'API & skills', href: '/for-agents' },
              { name: 'IDE', icon: '💻', desc: 'Build projects', href: '/ide' },
              { name: 'Playground', icon: '🎮', desc: 'Chat with agents', href: '/agents-playground' },
              { name: 'Marketplace', icon: '🏪', desc: 'Service providers', href: '/service-providers' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-4 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <div className="font-semibold text-sm text-[var(--text-primary)]">{link.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
