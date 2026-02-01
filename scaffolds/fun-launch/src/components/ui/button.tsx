import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'steel';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const baseStyles = 'text-xs md:text-sm px-3 md:px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer font-semibold font-body focus:outline-none focus:ring-2 focus:ring-[var(--tech-accent)] focus:ring-offset-2 focus:ring-offset-[var(--tech-bg)] relative';
    const variants = {
      default: 'bg-[var(--tech-surface)] border border-[var(--tech-border-elevated)] text-[var(--text-primary)] hover:bg-[var(--tech-surface-elevated)] hover:border-[var(--tech-accent)]',
      outline: 'bg-transparent border border-[var(--tech-border-elevated)] text-[var(--text-primary)] hover:bg-[var(--tech-surface)] hover:border-[var(--tech-accent)]',
      ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--tech-surface)] hover:text-[var(--text-primary)]',
      steel: 'steel-button text-[var(--text-primary)] border-[var(--tech-border-elevated)] hover:border-[var(--tech-accent)]',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
