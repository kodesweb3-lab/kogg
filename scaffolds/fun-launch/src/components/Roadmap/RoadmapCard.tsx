import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { FeatureList } from './FeatureList';
import { cn } from '@/lib/utils';

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'coming-soon' | 'planned' | 'vision';
  features: string[];
  icon: React.ReactNode;
  glowColor: string;
  index: number;
};

interface RoadmapCardProps {
  phase: RoadmapPhase;
  className?: string;
}

export function RoadmapCard({ phase, className }: RoadmapCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: phase.index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        'relative bg-gradient-to-br from-steam-cyber-metal/20 to-steam-cyber-bronze/10',
        'border-2 rounded-xl p-6 backdrop-blur-sm',
        'border-steam-cyber-neon-cyan/30',
        `shadow-[0_0_30px_${phase.glowColor}]`,
        'hover:border-steam-cyber-neon-cyan/60',
        'transition-all duration-300',
        className
      )}
    >
      {/* Decorative screws */}
      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-steam-cyber-bronze bg-steam-cyber-metal/50" />
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-steam-cyber-bronze bg-steam-cyber-metal/50" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-steam-cyber-bronze bg-steam-cyber-metal/50" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-steam-cyber-bronze bg-steam-cyber-metal/50" />

      {/* Icon */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-4xl">{phase.icon}</div>
        <StatusBadge status={phase.status} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-heading font-bold mb-2 text-white neon-cyan-glow">
        {phase.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 font-body mb-4">{phase.description}</p>

      {/* Features */}
      <FeatureList features={phase.features} />
    </motion.div>
  );
}
