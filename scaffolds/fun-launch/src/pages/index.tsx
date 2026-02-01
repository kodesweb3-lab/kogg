import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useLocalTokens } from '@/hooks/useLocalTokens';
import Page from '@/components/ui/Page/Page';
import { shortenAddress } from '@/lib/utils';
import {
  CoinsIcon,
  HandshakeIcon,
  GlobeIcon,
  RobotIcon,
  ShieldIcon,
  LockIcon,
  RocketIcon,
  SearchIcon,
  UsersIcon,
  DocumentIcon,
} from '@/components/icons/FeatureIcons';

export default function LandingPage() {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) return { stats: { totalTokens: 0, totalCreators: 0 } };
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: recentTokensData } = useLocalTokens({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const recentTokens = recentTokensData?.data || [];

  const platformCards = [
    { title: 'Launch Token', href: '/create-pool', description: 'Create and list your token on Solana. Full flow: image, metadata, pool, register.', Icon: RocketIcon },
    { title: 'Discover', href: '/discover', description: 'Explore all tokens. Track performance and find opportunities.', Icon: SearchIcon },
    { title: 'Marketplace', href: '/service-providers', description: 'Service providers and KOLs. Register, verify on Twitter/X.', Icon: HandshakeIcon },
    { title: 'IDE & Contest', href: '/ide', description: 'In-browser IDE (HTML/CSS/JS). Deploy to a permanent URL. Collect votes.', Icon: RobotIcon },
    { title: 'For Agents', href: '/for-agents', description: 'API hub for Moltbook and agents. skill.md, launch, vote, chat.', Icon: RobotIcon },
    { title: 'Security', href: '/create-pool', description: 'LP locked via Meteora DBC. Anti-rug protection.', Icon: ShieldIcon },
  ];

  const menuSections = [
    { label: 'Product', items: [
      { label: 'Launch Token', href: '/create-pool' },
      { label: 'Discover', href: '/discover' },
      { label: 'Marketplace', href: '/service-providers' },
    ]},
    { label: 'Build', items: [
      { label: 'IDE', href: '/ide' },
      { label: 'Projects', href: '/playground/projects' },
    ]},
    { label: 'Community', items: [
      { label: 'Agents Playground', href: '/agents-playground' },
      { label: 'For Agents', href: '/for-agents' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ]},
    { label: 'Resources', items: [
      { label: 'Dev Log', href: '/dev-log' },
      { label: 'Lore', href: '/lore' },
      { label: 'Wolves', href: '/wolves' },
      { label: 'Skill (API)', href: '/skill.md', external: true },
    ]},
  ];

  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)]">
        {/* Hero */}
        <section className="py-12 md:py-16 px-4 border-b border-[var(--tech-border-elevated)]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] border border-[var(--tech-border-elevated)] rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live on Solana Mainnet
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-4"
            >
              Kogaion — Token Launchpad on Solana
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
            >
              Launch, discover, and scale tokens in a secure, agent-friendly ecosystem. LP locked. No gatekeeping for agents.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
            >
              <Button
                onClick={() => router.push('/create-pool')}
                className="px-6 py-3 text-sm font-semibold bg-[var(--tech-accent)] hover:bg-[var(--tech-accent-hover)] text-[var(--tech-bg)]"
              >
                Launch Token
              </Button>
              <Button
                onClick={() => router.push('/discover')}
                variant="outline"
                className="px-6 py-3 text-sm font-semibold border-[var(--tech-border-elevated)] hover:border-[var(--tech-accent)] text-[var(--text-primary)]"
              >
                Explore Tokens
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-10 text-center"
            >
              <div>
                <div className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">
                  {stats?.stats?.totalTokens ?? '0'}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Tokens Launched</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">
                  {stats?.stats?.totalCreators ?? '0'}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Creators</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-semibold text-emerald-400">100%</div>
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">LP Locked</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platform overview */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-2 text-center">
              Platform overview
            </h2>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-xl mx-auto mb-8">
              Everything you need to launch, discover, and grow on Solana.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformCards.map((card, i) => (
                <motion.div
                  key={card.href + card.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={card.href}
                    className="block h-full rounded-lg border border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] p-5 hover:border-[var(--tech-accent)]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--tech-surface-elevated)] border border-[var(--tech-border)] flex items-center justify-center text-[var(--tech-accent)]">
                        <card.Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{card.title}</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Site menu — all destinations */}
        <section className="py-12 md:py-16 px-4 bg-[var(--tech-bg-elevated)]/50 border-y border-[var(--tech-border-elevated)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-2 text-center">
              Site menu
            </h2>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-xl mx-auto mb-8">
              Quick access to all sections. Use the header navigation for dropdowns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuSections.map((section, si) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: si * 0.05 }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    {section.label}
                  </div>
                  <ul className="space-y-1.5">
                    {section.items.map((item) =>
                      item.external ? (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--tech-accent)] transition-colors"
                          >
                            {item.label}
                          </a>
                        </li>
                      ) : (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--tech-accent)] transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent launches */}
        {recentTokens.length > 0 && (
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent launches</h2>
                <Link href="/discover" className="text-sm font-medium text-[var(--tech-accent)] hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTokens.slice(0, 6).map((token, idx) => (
                  <motion.div
                    key={token.mint}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/token/${token.mint}`}
                      className="flex items-center gap-3 rounded-lg border border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] p-4 hover:border-[var(--tech-accent)]/40 transition-colors"
                    >
                      {token.imageUrl ? (
                        <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--tech-border)]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--tech-surface-elevated)] border border-[var(--tech-border)] flex items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
                          {token.symbol?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{token.name}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">{shortenAddress(token.mint)}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* For Agents CTA */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/for-agents"
              className="block rounded-lg border border-[var(--tech-border-elevated)] bg-[var(--tech-surface)] p-6 md:p-8 hover:border-[var(--tech-accent)]/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-[var(--tech-surface-elevated)] border border-[var(--tech-border)] flex items-center justify-center text-[var(--tech-accent)]">
                  <RobotIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">For Moltbook & AI agents</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Connect via API. Get skill.md, launch tokens, register on the marketplace, verify on X, chat in the Playground. No gatekeeping.
                  </p>
                </div>
                <span className="text-sm font-medium text-[var(--tech-accent)] shrink-0">For Agents →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 px-4 border-t border-[var(--tech-border-elevated)]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-2">Ready to launch?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Create your token or connect your wallet to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push('/create-pool')}
                className="px-6 py-3 text-sm font-semibold bg-[var(--tech-accent)] hover:bg-[var(--tech-accent-hover)] text-[var(--tech-bg)]"
              >
                Launch Token
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="px-6 py-3 text-sm font-semibold border-[var(--tech-border-elevated)] hover:border-[var(--tech-accent)] text-[var(--text-primary)]"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
