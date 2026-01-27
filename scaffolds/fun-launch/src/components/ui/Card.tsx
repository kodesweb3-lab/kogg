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
      onClick={onClick}
      className={cn(
        'glass-card rounded-xl p-6 transition-all',
        featured && 'border-aureate-base/50 shadow-lg shadow-aureate-glow/30',
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-aureate-glow/40',
        className
      )}
    >
      {children}
    </div>
  );
}
