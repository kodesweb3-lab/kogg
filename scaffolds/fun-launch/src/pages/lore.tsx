import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GearIcon, BrainIcon, VisionIcon, ComingSoonIcon } from '@/components/icons/MiscIcons';
import { RobotIcon } from '@/components/icons/FeatureIcons';
import { CompletedIcon } from '@/components/icons/StatusIcons';

export default function LorePage() {
  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-[var(--accent)] tracking-tight">
              The Evolution
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] font-body italic">
              From Myth to Machine
            </p>
          </motion.div>

          {/* Timeline Vertical */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent)]/50 via-[var(--accent)]/30 to-[var(--accent)]/40 transform md:-translate-x-1/2" />

            {/* Chapter 1: Origin */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mb-20 pl-20 md:pl-0 md:pr-1/2 md:w-1/2 md:ml-auto"
            >
              <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-base)] transform -translate-x-1/2 md:translate-x-1/2" />
              <div className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-[var(--accent)] mt-1">
                    <GearIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-[var(--accent)]">
                      Origin
                    </h2>
                    <p className="text-sm md:text-base text-[var(--text-muted)] font-body leading-relaxed mb-3">
                      In ancient Dacia, the Kogaion mountain stood as a sacred peak. Warriors ascended to prove their worth. The wolf watched over each climb.
                    </p>
                    <p className="text-[var(--accent)] font-heading italic text-sm md:text-base">
                      "Those who reached the summit joined the pack."
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Chapter 2: Evolution */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-20 pl-20 md:pl-1/2 md:w-1/2"
            >
              <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-base)] transform -translate-x-1/2 md:-translate-x-1/2" />
              <div className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 relative border-[var(--accent)]/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-[var(--accent)] mt-1">
                    <BrainIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-[var(--accent)]">
                      Evolution
                    </h2>
                    <p className="text-sm md:text-base text-[var(--text-muted)] font-body leading-relaxed mb-3">
                      In 2026, the legend transformed. The wolf became hybrid—mechanical meets digital. Gears merged with neural circuits.
                    </p>
                    <p className="text-[var(--accent)] font-heading italic text-sm md:text-base">
                      "Kogaion is no longer just a guardian—it's a protocol. A neural network. A swarm."
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Chapter 3: Machine */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative mb-20 pl-20 md:pl-0 md:pr-1/2 md:w-1/2 md:ml-auto"
            >
              <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-base)] transform -translate-x-1/2 md:translate-x-1/2" />
              <div className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 relative border-[var(--accent)]/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-[var(--accent)] mt-1">
                    <RobotIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-[var(--accent)]">
                      Machine
                    </h2>
                    <p className="text-sm md:text-base text-[var(--text-muted)] font-body leading-relaxed mb-3">
                      Each token is a node. Each trade is a pulse. Each holder is a connection. The swarm grows.
                    </p>
                    <p className="text-[var(--accent)] font-heading italic text-sm md:text-base">
                      "The ritual is complete. The machine awakens."
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* The Three Pillars - Compact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-center text-[var(--accent)]">
              The Three Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Meteora DBC */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="mb-4 text-[var(--accent)]">
                    <GearIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-[var(--accent)]">
                    The Mechanical Heart
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] font-body mb-4">
                    Meteora DBC powers our bonding curves. The mechanical engine that drives price
                    discovery and automatic graduation.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-heading font-bold bg-[var(--accent)]/20 text-[var(--accent)] rounded-full border border-[var(--accent)]/30">
                    <CompletedIcon className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </motion.div>

              {/* Pillar 2: Genesis SDK */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--bg-layer)] border border-[var(--accent)]/30 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <BrainIcon className="w-12 h-12 mb-4 text-[var(--accent)]" />
                  <h3 className="text-xl font-heading font-bold mb-2 text-[var(--accent)]">
                    The Neural Pathways
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] font-body mb-4">
                    Genesis SDK standardizes launches. The neural network that ensures transparency,
                    security, and fair tokenomics.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-heading font-bold bg-[var(--accent)]/20 text-[var(--accent)] rounded-full border border-[var(--accent)]/30">
                    <ComingSoonIcon className="w-3 h-3" />
                    In Development
                  </span>
                </div>
              </motion.div>

              {/* Pillar 3: Autonomous AI */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-[var(--bg-layer)] border border-[var(--accent)]/30 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="mb-4 text-[var(--accent)]">
                    <RobotIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2 text-[var(--accent)]">
                    The Swarm Intelligence
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] font-body mb-4">
                    Autonomous AI agents for each token. The swarm that manages communities,
                    analyzes markets, and operates independently.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-heading font-bold bg-[var(--accent)]/20 text-[var(--accent)] rounded-full border border-[var(--accent)]/30">
                    <VisionIcon className="w-3 h-3" />
                    Vision
                  </span>
                </div>
              </motion.div>
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
                  className="border border-[var(--accent)]/30 text-[var(--accent)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 px-8 py-3"
                >
                  Read Technical Documentation
                </Button>
              </Link>
              <Link href="/create-pool">
                <Button className="bg-[var(--accent)] hover:opacity-90 text-[var(--bg-base)] font-heading font-bold px-8 py-3 transition-all">
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
