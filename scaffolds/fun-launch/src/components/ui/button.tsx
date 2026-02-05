import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'default' | 'steel';
  size?: 'sm' | 'md' | 'lg';
  /** Pill shape (full rounded). Override with className if needed. */
  pill?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'md', pill = false, ...props }, ref) => {
    const resolvedVariant = variant === 'steel' ? 'secondary' : variant;
    const sizeStyles = {
      sm: 'text-xs px-3 py-2 min-h-9 rounded-lg',
      md: 'text-sm px-5 py-2.5 min-h-10 rounded-xl',
      lg: 'text-base px-6 py-3 min-h-12 rounded-xl',
    };
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--accent)] text-[var(--bg-base)] border-0 hover:brightness-110 hover:shadow-lg shadow-md',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-layer)] hover:border-[var(--accent)]/30',
      outline:
        'bg-transparent border-2 border-[var(--accent)]/60 text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]',
      ghost:
        'bg-transparent text-[var(--text-muted)] border-0 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
      default:
        'bg-[var(--bg-layer)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]',
    };

    const pillClass = pill ? '!rounded-full' : '';

    return (
      <button
        className={cn(baseStyles, sizeStyles[size], variants[resolvedVariant], pillClass, className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
