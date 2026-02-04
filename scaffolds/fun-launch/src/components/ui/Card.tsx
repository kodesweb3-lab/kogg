'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  featured?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, featured = false, onClick }: GlassCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'glass-card rounded-[var(--radius-lg)] p-6 transition-all',
        featured && 'border-aureate-base/50 shadow-lg shadow-aureate-glow/30',
        onClick &&
          'cursor-pointer hover:scale-[1.02] hover:shadow-aureate-glow/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cyber-bg)]',
        className
      )}
    >
      {children}
    </div>
  );
}
