'use client';

import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import Link from 'next/link';

export default function DevLogPage() {
  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-8 md:py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-aureate-base">
              Dev Log
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] font-body max-w-3xl mx-auto">
              Building the future of token launchpads. Track our progress, updates, and what's coming next.
            </p>
          </motion.div>

          {/* What We've Built */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-aureate-base border-b border-aureate-base/30 pb-4">
              What We've Built
            </h2>
            
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6 md:p-8 rim-light">
                <h3 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                  Obsidian + Aureate Design System
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed mb-4">
                  We've completely transformed Kogaion's visual identity with a premium Obsidian + Aureate design system. The platform now features a luxury museum aesthetic with glass-morphic cards, sigil iconography, and a cohesive theming system.
                </p>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)] font-body ml-4">
                  <li>Design tokens system with CSS variables</li>
                  <li>Global Wolf Theming with 5 pack themes (Fire, Frost, Blood, Moon, Stone)</li>
                  <li>Glass-morphic cards with rim-light effects</li>
                  <li>Sigil icon system for status badges and ranks</li>
                  <li>Consistent motion system with Framer Motion</li>
                  <li>Fluid typography with responsive scaling</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 md:p-8 rim-light">
                <h3 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                  Service Providers Marketplace
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed mb-4">
                  A comprehensive marketplace connecting token creators with service providers. KOLs, marketers, moderators, and other professionals can register and showcase their services.
                </p>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)] font-body ml-4">
                  <li>Provider registration with Twitter verification</li>
                  <li>Service tags system with custom tag support</li>
                  <li>Premium table layout for detailed information</li>
                  <li>Automated marketing tweet for verification</li>
                  <li>Telegram, email, and wallet integration</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 md:p-8 rim-light">
                <h3 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                  Real World Assets (RWA) Tokenization
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed mb-4">
                  Expanded beyond memecoins to support Real World Assets tokenization. Users can now tokenize physical products, services, property, intellectual property, and any real-world asset.
                </p>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)] font-body ml-4">
                  <li>Dedicated RWA token type in launch form</li>
                  <li>Asset type classification and valuation</li>
                  <li>Document upload support via decentralized storage</li>
                  <li>Asset location tracking</li>
                  <li>RWA-specific badges and display</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 md:p-8 rim-light">
                <h3 className="text-2xl font-heading font-bold mb-4 text-aureate-light">
                  Motion System & Micro-interactions
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed mb-4">
                  Implemented a consistent animation system using Framer Motion with reusable variants, page transitions, and signature ritual moments.
                </p>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)] font-body ml-4">
                  <li>Centralized motion variants library</li>
                  <li>Page transitions with AnimatePresence</li>
                  <li>Signature ritual moments (wallet connection, token launch)</li>
                  <li>Microcopy system with wolf-adaptive messages</li>
                  <li>GPU-accelerated animations for performance</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* What We're Building */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-aureate-base border-b border-aureate-base/30 pb-4">
              What We're Building
            </h2>
            
            <div className="glass-card rounded-xl p-6 md:p-8 rim-light">
              <p className="text-[var(--text-primary)]/80 font-body leading-relaxed">
                Currently focused on platform optimizations, performance improvements, and enhancing the user experience across all features. We're continuously refining the design system and adding new capabilities based on community feedback.
              </p>
            </div>
          </motion.section>

          {/* What's Next */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-aureate-base border-b border-aureate-base/30 pb-4">
              What's Next
            </h2>
            
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6 md:p-8 rim-light border-wolf-border/30">
                <h3 className="text-xl font-heading font-bold mb-3 text-aureate-light">
                  Genesis SDK Anti-Rug Integration
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed">
                  Planning to integrate Genesis SDK for enhanced security and anti-rug protection. This will provide standardized tokenomics, enhanced security checks, and better token verification, making Kogaion one of the most secure launchpads.
                </p>
                <p className="text-[var(--text-muted)] font-body text-sm mt-3">
                  Timeline: Q2 2026
                </p>
              </div>

              <div className="glass-card rounded-xl p-6 md:p-8 rim-light border-wolf-border/30">
                <h3 className="text-xl font-heading font-bold mb-3 text-aureate-light">
                  Enhanced AI Bot Capabilities
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed">
                  Significant enhancements to our AI bot system including multi-agent swarms, advanced analytics, predictive market analysis, and cross-platform deployment. All while maintaining the 100% user-owned personality system.
                </p>
                <p className="text-[var(--text-muted)] font-body text-sm mt-3">
                  Timeline: Q2-Q4 2026
                </p>
              </div>

              <div className="glass-card rounded-xl p-6 md:p-8 rim-light border-wolf-border/30">
                <h3 className="text-xl font-heading font-bold mb-3 text-aureate-light">
                  Mobile Application
                </h3>
                <p className="text-[var(--text-primary)]/80 font-body leading-relaxed">
                  Native mobile applications for iOS and Android with full token launch functionality, trading terminal, portfolio management, push notifications, and biometric authentication.
                </p>
                <p className="text-[var(--text-muted)] font-body text-sm mt-3">
                  Timeline: Q3-Q4 2026 (Beta), Q1 2027 (Public Release)
                </p>
              </div>
            </div>
          </motion.section>

          {/* Technical Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-aureate-base border-b border-aureate-base/30 pb-4">
              Technical Architecture
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6 rim-light">
                <h3 className="text-lg font-heading font-bold mb-3 text-aureate-light">
                  Design System
                </h3>
                <ul className="space-y-1 text-[var(--text-muted)] font-body text-sm">
                  <li>• CSS Variables & Semantic Tokens</li>
                  <li>• Tailwind CSS Integration</li>
                  <li>• Glass-morphic Components</li>
                  <li>• Responsive Typography</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 rim-light">
                <h3 className="text-lg font-heading font-bold mb-3 text-aureate-light">
                  Frontend Stack
                </h3>
                <ul className="space-y-1 text-[var(--text-muted)] font-body text-sm">
                  <li>• Modern React Framework</li>
                  <li>• TypeScript</li>
                  <li>• Animation Library</li>
                  <li>• Data Fetching & Caching</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 rim-light">
                <h3 className="text-lg font-heading font-bold mb-3 text-aureate-light">
                  Blockchain Integration
                </h3>
                <ul className="space-y-1 text-[var(--text-muted)] font-body text-sm">
                  <li>• Blockchain SDK</li>
                  <li>• Dynamic Bonding Curve Protocol</li>
                  <li>• DEX Aggregation</li>
                  <li>• Blockchain RPC</li>
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6 rim-light">
                <h3 className="text-lg font-heading font-bold mb-3 text-aureate-light">
                  Infrastructure
                </h3>
                <ul className="space-y-1 text-[var(--text-muted)] font-body text-sm">
                  <li>• Relational Database</li>
                  <li>• Decentralized Storage</li>
                  <li>• Cloud Infrastructure</li>
                  <li>• Server-side API Routes</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* The Direction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-aureate-base border-b border-aureate-base/30 pb-4">
              The Direction
            </h2>
            
            <div className="glass-card rounded-xl p-8 md:p-12 rim-light">
              <p className="text-lg font-body leading-relaxed text-[var(--text-primary)]/80 mb-6">
                <strong className="text-aureate-base">Kogaion</strong> is evolving into the most comprehensive and secure launchpad. We're building beyond just token launches—we're creating an ecosystem.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-obsidian-surface/50 rounded-lg p-4 border border-aureate-base/20">
                  <h3 className="font-heading font-bold text-aureate-base mb-2">Genesis SDK Integration</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Anti-rug protection, standardized tokenomics, and enhanced security for all launches.
                  </p>
                </div>
                <div className="bg-obsidian-surface/50 rounded-lg p-4 border border-aureate-base/20">
                  <h3 className="font-heading font-bold text-aureate-base mb-2">AI & Automation</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Autonomous AI agents, smart contract automation, and intelligent market analysis.
                  </p>
                </div>
                <div className="bg-obsidian-surface/50 rounded-lg p-4 border border-aureate-base/20">
                  <h3 className="font-heading font-bold text-aureate-base mb-2">Real World Assets</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Tokenize products, services, and assets. Beyond memecoins, into real value.
                  </p>
                </div>
                <div className="bg-obsidian-surface/50 rounded-lg p-4 border border-aureate-base/20">
                  <h3 className="font-heading font-bold text-aureate-base mb-2">Service Marketplace</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Connect with KOLs, marketers, moderators, and service providers. Build your pack.
                  </p>
                </div>
              </div>
              
              <p className="mt-6 text-[var(--text-primary)]/80 font-body">
                We're committed to giving developers more than any other platform. Higher fees, better tools, and a complete ecosystem to build on.
              </p>
            </div>
          </motion.section>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="glass-card rounded-xl p-8 rim-light">
              <h3 className="text-2xl font-heading font-bold mb-4 text-aureate-base">
                Join the Pack
              </h3>
              <p className="text-[var(--text-primary)]/70 font-body mb-6 max-w-2xl mx-auto">
                Follow our progress, launch your tokens, and be part of the evolution. The future of token launchpads is being built here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://x.com/KogaionSol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-aureate-base/80 hover:bg-aureate-base text-obsidian-base font-heading font-bold rounded-lg transition-all rim-light"
                >
                  Follow on X
                </a>
                <a
                  href="https://t.me/kogaionpack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-obsidian-surface hover:bg-obsidian-elevated text-[var(--text-primary)] font-heading font-bold rounded-lg border border-aureate-base/30 transition-all rim-light"
                >
                  Join Telegram
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
