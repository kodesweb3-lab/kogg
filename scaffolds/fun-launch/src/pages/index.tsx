import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

const LiveFeed = dynamic(() => import('@/components/LiveFeed'), { ssr: false });

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

  return (
    <div className="min-h-screen bg-dacian-steel-dark text-mystic-steam-parchment relative">
      {/* Layered atmospheric background */}
      <div className="atmosphere-layer" />
      <div className="steam-layer" />
      <div className="castle-silhouette" />
      <div className="dacian-pattern" />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Enhanced background with steam layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-dacian-steel-dark via-dacian-steel-gunmetal to-dacian-steel-dark">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 111, 71, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(107, 82, 51, 0.06) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20 text-center">
          {/* Beta Banner */}
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
              Now Live on Solana Mainnet
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <img 
              src="/brand/kogaion-logo.svg" 
              alt="Kogaion" 
              className="mx-auto h-16 md:h-24 lg:h-32"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 text-mystic-steam-copper"
          >
            Summon Tokens.
            <br />
            Ascend Markets.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-mystic-steam-parchment/70 mb-8 md:mb-12 max-w-2xl mx-auto font-body px-4"
          >
            The ritual begins here. Launch your token on Solana with the power of the pack.
            No cap, no limits—just pure ascent.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
          >
            <Button
              onClick={() => router.push('/create-pool')}
              variant="steel"
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 text-dacian-copper-light font-heading"
            >
              Launch a Token
            </Button>
            <Button
              onClick={() => router.push('/discover')}
              variant="outline"
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-dacian-steel-steel/40 hover:border-dacian-steel-steel/60"
            >
              Explore the Pack
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 md:mt-16 flex flex-wrap justify-center gap-6 md:gap-12"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-mystic-steam-parchment">
                {stats?.stats?.totalTokens || '0'}
              </div>
              <div className="text-xs md:text-sm text-mystic-steam-parchment/50 font-body">Tokens Summoned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-mystic-steam-parchment">
                {stats?.stats?.totalCreators || '0'}
              </div>
              <div className="text-xs md:text-sm text-mystic-steam-parchment/50 font-body">Pack Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-mystic-steam-copper">
                100%
              </div>
              <div className="text-xs md:text-sm text-mystic-steam-parchment/50 font-body">LP Locked</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-mystic-steam-parchment/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Feed Section */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <LiveFeed />
        </div>
      </section>

      {/* What is Kogaion */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-mystic-steam-copper">
            What is Kogaion?
          </h2>
          <p className="text-lg text-mystic-steam-parchment/70 text-center font-body leading-relaxed">
            Kogaion is the Dacian Wolf spirit—guardian of the mountain, guide of the ascent.
            On Solana, we summon tokens through the ritual of the Dynamic Bonding Curve.
            Each launch is a climb. Each holder joins the pack. Each graduation to DAMM v2
            marks a new peak conquered.
          </p>
        </div>
      </section>

      {/* How the Ritual Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-mystic-steam-copper">
            How the Ritual Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Summon',
                description: 'Create your token with image, metadata, and launch parameters. The ritual begins.',
                icon: '⚡',
              },
              {
                title: 'Ascend',
                description: 'Traders join the pack. Price moves along the bonding curve. Liquidity builds.',
                icon: '📈',
              },
              {
                title: 'Graduate',
                description: 'When conditions are met, your token graduates to DAMM v2—permanent liquidity unlocked.',
                icon: '🎓',
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="steel-panel p-6 rounded-lg"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-heading font-semibold mb-3 text-mystic-steam-copper">
                  {step.title}
                </h3>
                <p className="text-mystic-steam-parchment/70 font-body">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Wolves */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-mystic-steam-copper">
            AI Wolves
          </h2>
          <p className="text-lg text-mystic-steam-parchment/70 mb-8 font-body">
            Give your token a personality. Choose a preset wolf (Fire, Frost, Blood, Moon, Stone)
            or build your own. Each bot is 100% user-owned—Kogaion only provides the builder.
          </p>
          <Link href="/wolves">
            <Button className="text-lg px-8 py-4">
              Meet the Pack
            </Button>
          </Link>
        </div>
      </section>

      {/* Safety / LP Locked */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-mystic-steam-copper">
            Safety & Liquidity
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-mystic-steam-charcoal p-6 rounded-lg border border-mystic-steam-copper/30">
              <h3 className="text-xl font-heading font-semibold mb-3 text-mystic-steam-copper">
                🔒 LP Locked
              </h3>
              <p className="text-mystic-steam-parchment/70 font-body">
                All liquidity is locked via Meteora's Dynamic Bonding Curve. No rug pulls.
                No exit scams. Just pure, trustless ascent.
              </p>
            </div>
            <div className="bg-mystic-steam-charcoal p-6 rounded-lg border border-mystic-steam-copper/30">
              <h3 className="text-xl font-heading font-semibold mb-3 text-mystic-steam-copper">
                🛡️ Verified Contracts
              </h3>
              <p className="text-mystic-steam-parchment/70 font-body">
                Built on Meteora's audited smart contracts. Every transaction is on-chain.
                Every pool is transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 md:py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-4 text-mystic-steam-parchment/60">
            Coming Soon
          </h2>
          <p className="text-center text-mystic-steam-parchment/50 font-body mb-8 md:mb-12 max-w-xl mx-auto">
            The pack grows stronger. New features are being forged.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏆', title: 'Rewards', desc: 'Earn for trading' },
              { icon: '📊', title: 'Analytics', desc: 'Deep insights' },
              { icon: '🤖', title: 'Discord Bots', desc: 'Community tools' },
              { icon: '🎮', title: 'Gamification', desc: 'Level up system' },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-mystic-steam-charcoal/50 p-4 md:p-6 rounded-lg border border-mystic-steam-copper/20 text-center opacity-75"
              >
                <div className="text-2xl md:text-3xl mb-2">{item.icon}</div>
                <h3 className="font-heading font-semibold text-mystic-steam-parchment/60 text-sm md:text-base">{item.title}</h3>
                <p className="text-mystic-steam-parchment/40 text-xs md:text-sm font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
                className="steel-panel rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6 text-mystic-steam-copper">
              Ready to Begin the Ritual?
            </h2>
            <p className="text-base md:text-lg text-mystic-steam-parchment/70 mb-6 md:mb-8 font-body max-w-xl mx-auto">
              Join the pack. Launch your token. Ascend the mountain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/create-pool')}
                className="text-base md:text-lg px-8 md:px-12 py-3 md:py-4"
              >
                Launch Now
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                className="text-base md:text-lg px-8 md:px-12 py-3 md:py-4 bg-transparent border-2 border-mystic-steam-copper/30 text-mystic-steam-parchment/70 hover:border-mystic-steam-copper/50"
              >
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-mystic-steam-copper/20 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/brand/kogaion-icon.svg" alt="Kogaion" className="w-6 h-6" />
            <span className="text-sm text-mystic-steam-parchment/50 font-body">
              Kogaion Beta - Built on Solana
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://x.com/KogaionSol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-mystic-steam-parchment/50 hover:text-mystic-steam-copper transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://t.me/kogaionpack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-mystic-steam-parchment/50 hover:text-mystic-steam-copper transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
