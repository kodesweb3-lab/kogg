import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { Roadmap } from '@/components/Roadmap';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function RoadmapPage() {
  const router = useRouter();

  return (
    <Page>
      <div className="min-h-screen bg-steam-cyber-bg text-gray-100 py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 text-steam-cyber-neon-cyan neon-cyan-glow">
              The Ascent Roadmap
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-body max-w-2xl mx-auto">
              From Foundation to Alpha - Building the Future of Token Launches
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 max-w-2xl mx-auto"
          >
            <div className="bg-steam-cyber-bgElevated/50 border border-steam-cyber-neon-cyan/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-body text-gray-400">Platform Progress</span>
                <span className="text-sm font-heading font-bold text-steam-cyber-neon-cyan">20%</span>
              </div>
              <div className="h-2 bg-steam-cyber-bgHover rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '20%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-steam-cyber-neon-cyan to-steam-cyber-neon-green rounded-full"
                  style={{ boxShadow: '0 0 20px rgba(85, 234, 212, 0.5)' }}
                />
              </div>
              <p className="text-xs text-gray-500 font-body mt-2">
                1 of 5 phases complete
              </p>
            </div>
          </motion.div>

          {/* Roadmap Timeline */}
          <Roadmap />

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-br from-steam-cyber-metal/20 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-cyan/40 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-steam-cyber-neon-cyan">
                Ready to Begin Your Ascent?
              </h2>
              <p className="text-gray-400 font-body mb-6 max-w-xl mx-auto">
                Join the pack. Launch your token. Ascend the mountain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/create-pool')}
                  className="bg-gradient-to-r from-steam-cyber-neon-cyan to-steam-cyber-neon-cyan/80 text-black font-heading font-bold px-8 py-3 hover:shadow-[0_0_30px_rgba(85,234,212,0.6)] transition-all"
                >
                  Launch Token
                </Button>
                <Button
                  onClick={() => router.push('/discover')}
                  variant="outline"
                  className="border-2 border-steam-cyber-neon-cyan/50 text-steam-cyber-neon-cyan hover:border-steam-cyber-neon-cyan hover:bg-steam-cyber-neon-cyan/10 px-8 py-3"
                >
                  Explore Tokens
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
