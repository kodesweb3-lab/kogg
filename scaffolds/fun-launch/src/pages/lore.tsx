import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LorePage() {
  return (
    <Page>
      <div className="min-h-screen bg-steam-cyber-bg text-gray-100 py-12 md:py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-steam-cyber-neon-cyan neon-cyan-glow">
              The Evolution
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-body">
              From Myth to Machine - The Kogaion Transformation
            </p>
          </motion.div>

          {/* Section 1: The Origin */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-steam-cyber-metal/20 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-cyan/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="scanline-overlay absolute inset-0 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-steam-cyber-neon-cyan">
                  The Origin
                </h2>
                <div className="space-y-4 text-lg font-body leading-relaxed text-gray-300">
                  <p>
                    In ancient Dacia, the Kogaion mountain stood as a sacred peak—a place where
                    warriors ascended to prove their worth. The wolf, guardian of the mountain,
                    watched over each climb. Those who reached the summit joined the pack.
                  </p>
                  <p className="text-steam-cyber-neon-cyan font-heading text-xl mt-6">
                    But time flows, and legends evolve...
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: The Evolution */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-steam-cyber-bronze/20 to-steam-cyber-metal/10 border-2 border-steam-cyber-neon-yellow/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="scanline-overlay absolute inset-0 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-steam-cyber-neon-yellow">
                  The Evolution (2026)
                </h2>
                <div className="space-y-4 text-lg font-body leading-relaxed text-gray-300">
                  <p>
                    In 2026, the legend transformed. The wolf became a hybrid entity—part
                    mechanical, part digital. Rotating gears merged with neural circuits. Bronze
                    met neon. Steam met code.
                  </p>
                  <p>
                    <strong className="text-steam-cyber-neon-cyan">Kogaion is no longer just a guardian—it's a protocol. A neural network. A swarm.</strong>
                  </p>
                  <p>
                    Each token launched is a node in this network. Each trade is a pulse of energy.
                    Each holder is a connection in the digital pack.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 3: The Three Pillars */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center text-steam-cyber-neon-cyan">
              The Three Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Meteora DBC */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-steam-cyber-metal/30 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-cyan/40 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="scanline-overlay absolute inset-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-steam-cyber-neon-cyan">
                    The Mechanical Heart
                  </h3>
                  <p className="text-sm text-gray-400 font-body mb-4">
                    Meteora DBC powers our bonding curves. The mechanical engine that drives price
                    discovery and automatic graduation.
                  </p>
                  <span className="inline-block px-3 py-1 text-xs font-heading font-bold bg-steam-cyber-neon-green/20 text-steam-cyber-neon-green rounded-full border border-steam-cyber-neon-green/30">
                    ✅ Active
                  </span>
                </div>
              </motion.div>

              {/* Pillar 2: Genesis SDK */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-steam-cyber-metal/30 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-yellow/40 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="scanline-overlay absolute inset-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🧠</div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-steam-cyber-neon-yellow">
                    The Neural Pathways
                  </h3>
                  <p className="text-sm text-gray-400 font-body mb-4">
                    Genesis SDK standardizes launches. The neural network that ensures transparency,
                    security, and fair tokenomics.
                  </p>
                  <span className="inline-block px-3 py-1 text-xs font-heading font-bold bg-steam-cyber-neon-yellow/20 text-steam-cyber-neon-yellow rounded-full border border-steam-cyber-neon-yellow/30">
                    🔜 Coming Soon
                  </span>
                </div>
              </motion.div>

              {/* Pillar 3: Autonomous AI */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-steam-cyber-metal/30 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-pink/40 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="scanline-overlay absolute inset-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-steam-cyber-neon-pink">
                    The Swarm Intelligence
                  </h3>
                  <p className="text-sm text-gray-400 font-body mb-4">
                    Autonomous AI agents for each token. The swarm that manages communities,
                    analyzes markets, and operates independently.
                  </p>
                  <span className="inline-block px-3 py-1 text-xs font-heading font-bold bg-steam-cyber-neon-pink/20 text-steam-cyber-neon-pink rounded-full border border-steam-cyber-neon-pink/30">
                    🔮 Vision
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Section 4: The New Mapping */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-steam-cyber-metal/20 to-steam-cyber-bronze/10 border-2 border-steam-cyber-neon-cyan/30 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="scanline-overlay absolute inset-0 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-steam-cyber-neon-cyan">
                  The New Mapping (2026 Edition)
                </h2>
                <div className="space-y-6">
                  <div>
                    <strong className="text-steam-cyber-neon-cyan font-heading text-lg">
                      Mountain → Neural Network
                    </strong>
                    <p className="text-gray-300 font-body mt-2">
                      The bonding curve is now a neural pathway. Price discovery flows through
                      digital synapses. Each trade strengthens the connection.
                    </p>
                  </div>
                  <div>
                    <strong className="text-steam-cyber-neon-cyan font-heading text-lg">
                      Ascent → Data Flow
                    </strong>
                    <p className="text-gray-300 font-body mt-2">
                      Progress is measured in data streams. Market cap grows as information
                      propagates through the network. The token climbs through computational
                      layers.
                    </p>
                  </div>
                  <div>
                    <strong className="text-steam-cyber-neon-cyan font-heading text-lg">
                      Pack → Swarm
                    </strong>
                    <p className="text-gray-300 font-body mt-2">
                      Every trader who buys becomes a node in the swarm. Together, they form a
                      distributed intelligence. Collective action drives graduation.
                    </p>
                  </div>
                  <div>
                    <strong className="text-steam-cyber-neon-cyan font-heading text-lg">
                      Graduation → Autonomous Node
                    </strong>
                    <p className="text-gray-300 font-body mt-2">
                      When conditions are met, the token graduates to permanent liquidity. It
                      becomes an autonomous node in the network. The ritual is complete. The
                      machine awakens.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 5: The Vision */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-steam-cyber-neon-pink/10 to-steam-cyber-neon-cyan/10 border-2 border-steam-cyber-neon-pink/30 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="scanline-overlay absolute inset-0 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-steam-cyber-neon-pink">
                  The Vision
                </h2>
                <p className="text-lg md:text-xl text-gray-300 font-body leading-relaxed max-w-3xl mx-auto">
                  Kogaion is not just a launchpad. It's a ritual. A journey. An ascent. But now,
                  it's also a protocol. A neural network. A swarm.
                </p>
                <p className="text-lg md:text-xl text-gray-300 font-body leading-relaxed max-w-3xl mx-auto mt-4">
                  Every token that launches here begins a climb through digital layers. Every
                  holder joins the swarm. Every graduation marks a new node activated in the
                  network.
                </p>
                <p className="text-2xl md:text-3xl font-heading font-bold text-steam-cyber-neon-cyan mt-8 neon-cyan-glow">
                  From myth to machine. From pack to swarm. The evolution continues.
                </p>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/docs/TECH_STACK.md">
                <Button
                  variant="outline"
                  className="border-2 border-steam-cyber-neon-cyan/50 text-steam-cyber-neon-cyan hover:border-steam-cyber-neon-cyan hover:bg-steam-cyber-neon-cyan/10 px-8 py-3"
                >
                  Read Technical Documentation
                </Button>
              </Link>
              <Link href="/create-pool">
                <Button className="bg-gradient-to-r from-steam-cyber-neon-cyan to-steam-cyber-neon-cyan/80 text-black font-heading font-bold px-8 py-3 hover:shadow-[0_0_30px_rgba(85,234,212,0.6)] transition-all">
                  Begin the Ritual
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
