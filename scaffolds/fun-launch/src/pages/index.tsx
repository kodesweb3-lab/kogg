import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const { setShowModal } = useUnifiedWalletContext();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ritual-bg text-gray-100 relative">
      {/* Mountain silhouette background */}
      <div className="mountain-bg" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Mist animation background */}
        <div className="absolute inset-0 bg-gradient-to-b from-ritual-bg via-ritual-bgElevated to-ritual-bg">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <img 
              src="/brand/kogaion-logo.svg" 
              alt="Kogaion" 
              className="mx-auto h-24 md:h-32"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-ritual-amber-400"
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
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-body"
          >
            The ritual begins here. Launch your token on Solana with the power of the pack.
            No cap, no limits—just pure ascent.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => router.push('/create-pool')}
              className="text-lg px-8 py-4"
            >
              Launch a Token
            </Button>
            <Button
              onClick={() => router.push('/discover')}
              variant="outline"
              className="text-lg px-8 py-4 bg-transparent border-2 border-ritual-amber-500 text-ritual-amber-400 hover:bg-ritual-amber-500/10"
            >
              Explore the Pack
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What is Kogaion */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-ritual-amber-400">
            What is Kogaion?
          </h2>
          <p className="text-lg text-gray-300 text-center font-body leading-relaxed">
            Kogaion is the Dacian Wolf spirit—guardian of the mountain, guide of the ascent.
            On Solana, we summon tokens through the ritual of the Dynamic Bonding Curve.
            Each launch is a climb. Each holder joins the pack. Each graduation to DAMM v2
            marks a new peak conquered.
          </p>
        </div>
      </section>

      {/* How the Ritual Works */}
      <section className="py-20 px-4 bg-ritual-bgElevated">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12 text-ritual-amber-400">
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
                className="bg-ritual-bgHover p-6 rounded-lg border border-ritual-amber-500/20"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-heading font-semibold mb-3 text-ritual-amber-400">
                  {step.title}
                </h3>
                <p className="text-gray-300 font-body">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Wolves */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-ritual-amber-400">
            AI Wolves
          </h2>
          <p className="text-lg text-gray-300 mb-8 font-body">
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
      <section className="py-20 px-4 bg-ritual-bgElevated relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-ritual-amber-400">
            Safety & Liquidity
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-ritual-bgHover p-6 rounded-lg border border-ritual-amber-500/20">
              <h3 className="text-xl font-heading font-semibold mb-3 text-ritual-amber-400">
                🔒 LP Locked
              </h3>
              <p className="text-gray-300 font-body">
                All liquidity is locked via Meteora's Dynamic Bonding Curve. No rug pulls.
                No exit scams. Just pure, trustless ascent.
              </p>
            </div>
            <div className="bg-ritual-bgHover p-6 rounded-lg border border-ritual-amber-500/20">
              <h3 className="text-xl font-heading font-semibold mb-3 text-ritual-amber-400">
                🛡️ Verified Contracts
              </h3>
              <p className="text-gray-300 font-body">
                Built on Meteora's audited smart contracts. Every transaction is on-chain.
                Every pool is transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-ritual-amber-400">
            Ready to Begin the Ritual?
          </h2>
          <p className="text-lg text-gray-300 mb-8 font-body">
            Join the pack. Launch your token. Ascend the mountain.
          </p>
          <Button
            onClick={() => router.push('/create-pool')}
            className="text-lg px-12 py-4"
          >
            Launch Now
          </Button>
        </div>
      </section>
    </div>
  );
}
