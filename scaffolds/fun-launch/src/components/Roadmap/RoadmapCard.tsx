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
        'relative bg-[var(--bg-layer)]',
        'border border-[var(--border-default)] rounded-xl p-6 backdrop-blur-sm',
        'hover:border-[var(--accent)]/50',
        'transition-all duration-300',
        className
      )}
    >
      {/* Decorative screws */}
      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-elevated)]" />
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-elevated)]" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-elevated)]" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-elevated)]" />

      {/* Icon */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-4xl">{phase.icon}</div>
        <StatusBadge status={phase.status} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-heading font-bold mb-2 text-[var(--text-primary)]">
        {phase.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-muted)] font-body mb-4">{phase.description}</p>

      {/* Features */}
      <FeatureList features={phase.features} />
    </motion.div>
  );
}
