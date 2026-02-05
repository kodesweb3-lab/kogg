import { cn } from '@/lib/utils';

type Status = 'active' | 'coming-soon' | 'planned' | 'vision';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; color: string; glow: string }> = {
  active: {
    label: 'Active',
    color: 'text-[var(--accent)]',
    glow: '',
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'text-[var(--accent)]',
    glow: '',
  },
  planned: {
    label: 'Planned',
    color: 'text-[var(--text-secondary)]',
    glow: '',
  },
  vision: {
    label: 'Vision',
    color: 'text-[var(--text-muted)]',
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
