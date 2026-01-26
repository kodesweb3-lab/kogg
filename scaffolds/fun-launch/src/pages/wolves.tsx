import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { FireIcon, FrostIcon, BloodIcon, MoonIcon, StoneIcon } from '@/components/icons/MiscIcons';

const WOLF_PRESETS = [
  {
    name: 'Fire',
    description: 'Aggressive, energetic, hype-driven. Perfect for meme tokens that burn bright.',
    traits: ['aggressive', 'energetic', 'hype', 'bold'],
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10',
    Icon: FireIcon,
  },
  {
    name: 'Frost',
    description: 'Calm, analytical, professional. Ideal for utility tokens and serious projects.',
    traits: ['calm', 'analytical', 'professional', 'precise'],
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    Icon: FrostIcon,
  },
  {
    name: 'Blood',
    description: 'Dark, mysterious, edgy. For tokens with a gothic or underground vibe.',
    traits: ['dark', 'mysterious', 'edgy', 'intense'],
    color: 'text-red-600',
    borderColor: 'border-red-700/30',
    bgColor: 'bg-red-900/10',
    Icon: BloodIcon,
  },
  {
    name: 'Moon',
    description: 'Hopeful, optimistic, dreamy. Great for community-driven tokens with big aspirations.',
    traits: ['hopeful', 'optimistic', 'dreamy', 'inspiring'],
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    Icon: MoonIcon,
  },
  {
    name: 'Stone',
    description: 'Stable, reliable, grounded. Perfect for tokens that value consistency and trust.',
    traits: ['stable', 'reliable', 'grounded', 'trustworthy'],
    color: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    bgColor: 'bg-gray-500/10',
    Icon: StoneIcon,
  },
];

export default function WolvesPage() {
  const router = useRouter();

  return (
    <Page>
      <div className="min-h-screen text-mystic-steam-parchment py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-mystic-steam-copper">
              The Pack
            </h1>
            <p className="text-xl text-mystic-steam-parchment/70 font-body mb-8">
              Choose a preset personality or build your own. Each wolf is a starting point—
              you own the final voice.
            </p>
          </motion.div>

          {/* Wolves Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {WOLF_PRESETS.map((wolf, idx) => {
              const Icon = wolf.Icon;
              return (
                <motion.div
                  key={wolf.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`steel-panel p-6 md:p-8 rounded-xl transition-all border-2 ${wolf.borderColor} relative overflow-hidden hover:border-opacity-60`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${wolf.bgColor} rounded-full blur-3xl opacity-50 -z-0`} />
                  <div className="relative z-10">
                    <div className={`mb-4 ${wolf.color}`}>
                      <Icon className="w-12 h-12 md:w-16 md:h-16" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-mystic-steam-copper">
                      {wolf.name}
                    </h2>
                    <p className="text-mystic-steam-parchment/70 mb-4 font-body text-sm md:text-base leading-relaxed">
                      {wolf.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {wolf.traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-2.5 py-1 text-xs font-medium bg-dacian-steel-dark rounded-full border border-dacian-steel-steel/30 text-mystic-steam-parchment/70"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-mystic-steam-parchment/50 font-body italic">
                      Starter template—fully customizable
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Custom Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="steel-panel p-8 rounded-lg text-center"
          >
            <h2 className="text-3xl font-heading font-bold mb-4 text-mystic-steam-copper">
              Build Your Own
            </h2>
            <p className="text-lg text-mystic-steam-parchment/70 mb-6 font-body">
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
            className="mt-12 p-6 steel-panel rounded-lg"
          >
            <p className="text-mystic-steam-parchment/60 font-body text-center">
              <strong className="text-mystic-steam-copper">Important:</strong> All presets are
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
