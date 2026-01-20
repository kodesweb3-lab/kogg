import { cn } from '@/lib/utils';

type Status = 'active' | 'coming-soon' | 'planned' | 'vision';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; color: string; glow: string }> = {
  active: {
    label: 'Active',
    color: 'text-steam-cyber-neon-green',
    glow: 'shadow-[0_0_20px_rgba(0,255,136,0.5)]',
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'text-steam-cyber-neon-yellow',
    glow: 'shadow-[0_0_20px_rgba(243,230,0,0.5)]',
  },
  planned: {
    label: 'Planned',
    color: 'text-steam-cyber-neon-pink',
    glow: 'shadow-[0_0_20px_rgba(255,0,255,0.5)]',
  },
  vision: {
    label: 'Vision',
    color: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold border',
        config.color,
        `border-current ${config.glow}`,
        'bg-black/30 backdrop-blur-sm',
        className
      )}
    >
      {status === 'active' && '✓'}
      {status === 'coming-soon' && '→'}
      {status === 'planned' && '●'}
      {status === 'vision' && '◆'}
      {config.label}
    </span>
  );
}
