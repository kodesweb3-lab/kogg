import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'steel';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-[10px] px-2.5 py-1.5 rounded-lg min-h-[var(--button-min-height-touch)] sm:min-h-0',
      md: 'text-xs md:text-sm px-4 py-2.5 rounded-lg min-h-[var(--button-min-height-touch)] sm:min-h-0 sm:py-2.5',
      lg: 'text-sm px-6 py-3 rounded-xl min-h-[var(--button-min-height-touch)] sm:min-h-0 sm:py-3',
    };
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-semibold font-heading uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--cyber-accent)] focus:ring-offset-2 focus:ring-offset-[var(--cyber-bg)] disabled:opacity-50 disabled:pointer-events-none relative active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--cyber-accent)] text-[var(--cyber-bg)] border border-[var(--cyber-accent)] shadow-cyber-sm hover:shadow-cyber hover:brightness-110',
      default:
        'bg-[var(--cyber-surface)] border border-[var(--cyber-border-elevated)] text-[var(--text-primary)] hover:border-[var(--cyber-accent)]/50 hover:shadow-cyber-sm',
      outline:
        'bg-transparent border-2 border-[var(--cyber-accent)]/60 text-[var(--cyber-accent)] hover:bg-[var(--cyber-accent)]/10 hover:shadow-cyber-sm hover:border-[var(--cyber-accent)]',
      ghost:
        'bg-transparent text-[var(--text-muted)] hover:bg-[var(--cyber-surface)] hover:text-[var(--cyber-accent)]',
      steel:
        'bg-[var(--cyber-surface)] border border-[var(--cyber-border-elevated)] text-[var(--text-primary)] hover:border-[var(--cyber-accent)]/50 hover:shadow-cyber-sm',
    };

    return (
      <button
        className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
