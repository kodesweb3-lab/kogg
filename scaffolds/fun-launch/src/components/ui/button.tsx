import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'steel';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const baseStyles = 'text-xs md:text-base px-4 md:px-8 py-2 md:py-3 rounded-lg transition-all duration-200 cursor-pointer font-semibold font-body focus:outline-none focus:ring-2 focus:ring-mystic-steam-copper/50 focus:ring-offset-2 focus:ring-offset-mystic-steam-charcoal relative overflow-hidden';
    
    const variants = {
      default: 'bg-mystic-steam-ash border border-mystic-steam-copper/30 text-mystic-steam-parchment hover:bg-mystic-steam-ash/80 hover:border-mystic-steam-copper/50 hover:shadow-md',
      outline: 'bg-transparent border border-mystic-steam-copper/30 text-mystic-steam-parchment hover:bg-mystic-steam-ash/30 hover:border-mystic-steam-copper/50 hover:shadow-sm',
      ghost: 'bg-transparent text-mystic-steam-parchment hover:bg-mystic-steam-ash/20 hover:text-mystic-steam-parchment',
      steel: 'steel-button text-mystic-steam-parchment border-dacian-steel-steel hover:text-mystic-steam-parchment/90',
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
