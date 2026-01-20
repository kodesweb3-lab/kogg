import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

const WOLF_PRESETS = [
  {
    name: 'Fire',
    description: 'Aggressive, energetic, hype-driven. Perfect for meme tokens that burn bright.',
    traits: ['aggressive', 'energetic', 'hype', 'bold'],
    color: 'from-red-500 to-orange-500',
    icon: '🔥',
  },
  {
    name: 'Frost',
    description: 'Calm, analytical, professional. Ideal for utility tokens and serious projects.',
    traits: ['calm', 'analytical', 'professional', 'precise'],
    color: 'from-blue-400 to-cyan-500',
    icon: '❄️',
  },
  {
    name: 'Blood',
    description: 'Dark, mysterious, edgy. For tokens with a gothic or underground vibe.',
    traits: ['dark', 'mysterious', 'edgy', 'intense'],
    color: 'from-red-800 to-red-600',
    icon: '🩸',
  },
  {
    name: 'Moon',
    description: 'Hopeful, optimistic, dreamy. Great for community-driven tokens with big aspirations.',
    traits: ['hopeful', 'optimistic', 'dreamy', 'inspiring'],
    color: 'from-purple-400 to-pink-500',
    icon: '🌙',
  },
  {
    name: 'Stone',
    description: 'Stable, reliable, grounded. Perfect for tokens that value consistency and trust.',
    traits: ['stable', 'reliable', 'grounded', 'trustworthy'],
    color: 'from-gray-600 to-gray-400',
    icon: '🪨',
  },
];

export default function WolvesPage() {
  const router = useRouter();

  return (
    <Page>
      <div className="min-h-screen bg-steam-cyber-bg text-gray-100 py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-steam-cyber-neon-cyan neon-cyan-glow">
              The Pack
            </h1>
            <p className="text-xl text-gray-300 font-body mb-8">
              Choose a preset personality or build your own. Each wolf is a starting point—
              you own the final voice.
            </p>
          </motion.div>

          {/* Wolves Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {WOLF_PRESETS.map((wolf, idx) => (
              <motion.div
                key={wolf.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-steam-cyber-bgElevated p-6 rounded-lg border border-steam-cyber-neon-cyan/20 hover:border-steam-cyber-neon-cyan/40 transition-all"
              >
                <div className="text-5xl mb-4">{wolf.icon}</div>
                <h2 className="text-2xl font-heading font-bold mb-3 text-steam-cyber-neon-cyan">
                  {wolf.name}
                </h2>
                <p className="text-gray-300 mb-4 font-body">{wolf.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {wolf.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 text-xs bg-steam-cyber-bgHover rounded border border-steam-cyber-neon-cyan/20 text-gray-400"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 font-body italic">
                  Starter template—fully customizable
                </p>
              </motion.div>
            ))}
          </div>

          {/* Custom Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-steam-cyber-bgElevated p-8 rounded-lg border-2 border-steam-cyber-neon-cyan/40 text-center"
          >
            <h2 className="text-3xl font-heading font-bold mb-4 text-steam-cyber-neon-cyan">
              Build Your Own
            </h2>
            <p className="text-lg text-gray-300 mb-6 font-body">
              Start from scratch. Define every aspect of your token's personality.
              The builder is yours to command.
            </p>
            <Button
              onClick={() => router.push('/create-pool')}
              className="text-lg px-8 py-4"
            >
              Launch with Custom Personality
            </Button>
          </motion.div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-6 bg-steam-cyber-bgHover rounded-lg border border-steam-cyber-neon-cyan/20"
          >
            <p className="text-gray-400 font-body text-center">
              <strong className="text-steam-cyber-neon-cyan">Important:</strong> All presets are
              starting points. You can edit the system prompt, adjust sliders, and customize
              every aspect. Your token's personality is 100% user-owned—Kogaion only provides
              the tools.
            </p>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
