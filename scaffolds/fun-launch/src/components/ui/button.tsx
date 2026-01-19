import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const baseStyles = 'text-xs md:text-base px-4 md:px-8 py-2 md:py-3 rounded-lg transition-all cursor-pointer font-semibold font-body focus:outline-none focus:ring-2 focus:ring-ritual-amber-500 focus:ring-offset-2 focus:ring-offset-ritual-bg';
    
    const variants = {
      default: 'bg-gradient-to-r from-ritual-amber-400 to-ritual-amber-600 text-ritual-bg hover:opacity-90 shadow-lg hover:shadow-ritual-amber/50',
      outline: 'bg-transparent border-2 border-ritual-amber-500 text-ritual-amber-400 hover:bg-ritual-amber-500/10',
      ghost: 'bg-transparent text-ritual-amber-400 hover:bg-ritual-amber-500/10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
