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
      sm: 'text-xs px-3.5 py-2 min-h-9 rounded-[var(--radius-sm)]',
      md: 'text-sm px-5 py-2.5 min-h-10 rounded-[var(--radius-md)]',
      lg: 'text-base px-7 py-3.5 min-h-12 rounded-[var(--radius-md)]',
    };
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';

    const variants = {
      primary:
        'text-[#07090f] font-bold border-0 hover:brightness-110 shadow-glow-sm hover:shadow-glow',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-layer)] hover:border-[var(--accent)]/40',
      outline:
        'bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)] hover:shadow-glow-sm',
      ghost:
        'bg-transparent text-[var(--text-muted)] border-0 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
      default:
        'bg-[var(--bg-layer)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]',
    };

    const pillClass = pill ? '!rounded-full' : '';

    // Primary uses gradient background via inline style
    const isPrimary = resolvedVariant === 'primary';

    return (
      <button
        className={cn(baseStyles, sizeStyles[size], variants[resolvedVariant], pillClass, className)}
        ref={ref}
        style={isPrimary ? { background: 'var(--gradient-primary)', ...(props.style || {}) } : props.style}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
