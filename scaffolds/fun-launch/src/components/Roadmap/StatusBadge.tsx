import { cn } from '@/lib/utils';

type Status = 'active' | 'coming-soon' | 'planned' | 'vision';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; color: string; glow: string }> = {
  active: {
    label: 'Active',
    color: 'text-mystic-steam-copper',
    glow: '',
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'text-mystic-steam-gold',
    glow: '',
  },
  planned: {
    label: 'Planned',
    color: 'text-mystic-steam-bronze',
    glow: '',
  },
  vision: {
    label: 'Vision',
    color: 'text-mystic-steam-oxidized',
    glow: '',
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
