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
        'bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 transition-all',
        featured && 'border-[var(--accent)]/50 shadow-[var(--shadow-lg)]',
        onClick &&
          'cursor-pointer hover:scale-[1.02] hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        className
      )}
    >
      {children}
    </div>
  );
}
