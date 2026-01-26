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
  LightningIcon,
  RocketIcon,
  SearchIcon,
  UsersIcon,
  DocumentIcon,
} from '@/components/icons/FeatureIcons';

export default function LandingPage() {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) return { stats: { totalTokens: 0, totalCreators: 0 } };
      return res.json();
    },
    refetchInterval: 60000,
  });

  // Fetch recent tokens
  const { data: recentTokensData } = useLocalTokens({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const recentTokens = recentTokensData?.data || [];

  return (
    <Page>
      <div className="min-h-screen text-mystic-steam-parchment relative z-10">
        {/* Hero Section - Compact & Action-Focused */}
        <section className="relative py-12 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              {/* Beta Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-mystic-steam-copper/10 border border-mystic-steam-copper/30 rounded-full text-sm text-mystic-steam-copper font-body">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live on Solana Mainnet
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 text-mystic-steam-copper"
              >
                Launch Your Token
                <br />
                <span className="text-mystic-steam-parchment">On Solana</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-mystic-steam-parchment/70 mb-8 md:mb-10 max-w-2xl mx-auto font-body"
              >
                The most developer-friendly launchpad. Higher fees, better tools, complete ecosystem.
              </motion.p>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              >
                <Button
                  onClick={() => router.push('/create-pool')}
                  className="text-lg px-8 py-6 bg-mystic-steam-copper/80 hover:bg-mystic-steam-copper text-mystic-steam-parchment font-heading font-bold"
                >
                  Launch Token Now
                </Button>
                <Button
                  onClick={() => router.push('/discover')}
                  variant="outline"
                  className="text-lg px-8 py-6 border-mystic-steam-copper/30 hover:border-mystic-steam-copper/50"
                >
                  Explore Tokens
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-8 md:gap-12"
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-mystic-steam-copper">
                    {stats?.stats?.totalTokens || '0'}
                  </div>
                  <div className="text-sm text-mystic-steam-parchment/60 font-body">Tokens Launched</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-mystic-steam-copper">
                    {stats?.stats?.totalCreators || '0'}
                  </div>
                  <div className="text-sm text-mystic-steam-parchment/60 font-body">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-green-400">
                    100%
                  </div>
                  <div className="text-sm text-mystic-steam-parchment/60 font-body">LP Locked</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recent Launches */}
        {recentTokens.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-mystic-steam-copper">
                  Recent Launches
                </h2>
                <Link
                  href="/discover"
                  className="text-sm text-mystic-steam-parchment/60 hover:text-mystic-steam-copper transition-colors font-body"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTokens.slice(0, 6).map((token, idx) => (
                  <motion.div
                    key={token.mint}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      href={`/token/${token.mint}`}
                      className="steel-panel rounded-xl p-4 hover:border-mystic-steam-copper/50 transition-all block"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {token.imageUrl ? (
                          <img
                            src={token.imageUrl}
                            alt={token.symbol}
                            className="w-12 h-12 rounded-full object-cover border border-mystic-steam-copper/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-dacian-steel-gunmetal flex items-center justify-center text-mystic-steam-copper font-bold border border-mystic-steam-copper/20">
                            {token.symbol?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-mystic-steam-parchment truncate">
                            {token.name}
                          </h3>
                          <p className="text-sm text-mystic-steam-parchment/60 font-body truncate">
                            {token.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-mystic-steam-parchment/50 font-mono">
                        {shortenAddress(token.mint)}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Key Features for Creators */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-mystic-steam-copper">
                Why Launch on Kogaion?
              </h2>
              <p className="text-lg text-mystic-steam-parchment/60 font-body max-w-2xl mx-auto">
                Built for creators. Powered by innovation. Secured by design.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: 'Higher Developer Fees',
                  description: 'More revenue for creators than any other platform. We prioritize your success.',
                  Icon: CoinsIcon,
                },
                {
                  title: 'Service Marketplace',
                  description: 'Connect with KOLs, marketers, and service providers. Build your community.',
                  Icon: HandshakeIcon,
                },
                {
                  title: 'Real World Assets',
                  description: 'Tokenize products, services, or assets. Beyond memecoins, into real value.',
                  Icon: GlobeIcon,
                },
                {
                  title: 'AI Bot Builder',
                  description: 'Custom AI agents for your token. 100% user-owned, fully autonomous.',
                  Icon: RobotIcon,
                },
                {
                  title: 'Anti-Rug Protection',
                  description: 'Genesis SDK integration coming soon. Standardized, secure tokenomics.',
                  Icon: ShieldIcon,
                },
                {
                  title: 'LP Locked Forever',
                  description: 'All liquidity locked via Meteora DBC. No rug pulls, no exit scams.',
                  Icon: LockIcon,
                },
                {
                  title: 'Instant Graduation',
                  description: 'Automatic graduation to DAMM v2 when conditions are met.',
                  Icon: LightningIcon,
                },
                {
                  title: 'Complete Ecosystem',
                  description: 'Everything you need in one place. Launch, trade, grow, succeed.',
                  Icon: RocketIcon,
                },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="steel-panel rounded-xl p-6 md:p-8 hover:border-mystic-steam-copper/50 transition-all group"
                >
                  <div className="mb-4 md:mb-6 text-mystic-steam-copper group-hover:scale-110 transition-transform duration-300">
                    <feature.Icon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-bold mb-2 md:mb-3 text-mystic-steam-copper">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-mystic-steam-parchment/70 font-body leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/discover"
                  className="steel-panel rounded-xl p-6 md:p-8 hover:border-mystic-steam-copper/50 transition-all text-center group block"
                >
                  <div className="mb-4 text-mystic-steam-copper flex justify-center group-hover:scale-110 transition-transform duration-300">
                    <SearchIcon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-bold text-mystic-steam-copper mb-2">Discover Tokens</h3>
                  <p className="text-sm md:text-base text-mystic-steam-parchment/60 font-body">
                    Browse all launches and find opportunities
                  </p>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/service-providers"
                  className="steel-panel rounded-xl p-6 md:p-8 hover:border-mystic-steam-copper/50 transition-all text-center group block"
                >
                  <div className="mb-4 text-mystic-steam-copper flex justify-center group-hover:scale-110 transition-transform duration-300">
                    <UsersIcon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-bold text-mystic-steam-copper mb-2">Service Marketplace</h3>
                  <p className="text-sm md:text-base text-mystic-steam-parchment/60 font-body">
                    Find KOLs, marketers, and service providers
                  </p>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/dev-log"
                  className="steel-panel rounded-xl p-6 md:p-8 hover:border-mystic-steam-copper/50 transition-all text-center group block"
                >
                  <div className="mb-4 text-mystic-steam-copper flex justify-center group-hover:scale-110 transition-transform duration-300">
                    <DocumentIcon className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-bold text-mystic-steam-copper mb-2">Dev Log</h3>
                  <p className="text-sm md:text-base text-mystic-steam-parchment/60 font-body">
                    Track our progress and upcoming features
                  </p>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="steel-panel rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6 text-mystic-steam-copper">
                  Ready to Launch?
                </h2>
                <p className="text-base md:text-lg text-mystic-steam-parchment/70 mb-8 md:mb-10 font-body max-w-xl mx-auto leading-relaxed">
                  Join the pack. Launch your token. Build your community. Succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push('/create-pool')}
                    className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-mystic-steam-copper/80 hover:bg-mystic-steam-copper text-mystic-steam-parchment font-heading font-bold transition-all hover:scale-105"
                  >
                    Launch Token Now
                  </Button>
                  <Button
                    onClick={() => setShowModal(true)}
                    variant="outline"
                    className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 border-mystic-steam-copper/30 hover:border-mystic-steam-copper/50 transition-all hover:scale-105"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Page>
  );
}
