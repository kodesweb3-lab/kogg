import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const baseStyles = 'text-xs md:text-base px-4 md:px-8 py-2 md:py-3 rounded-lg transition-all cursor-pointer font-semibold font-body focus:outline-none focus:ring-2 focus:ring-steam-cyber-neon-cyan focus:ring-offset-2 focus:ring-offset-steam-cyber-bg relative overflow-hidden';
    
    const variants = {
      default: 'bg-gradient-to-r from-steam-cyber-neon-cyan to-steam-cyber-neon-cyan/80 text-black hover:shadow-[0_0_30px_rgba(85,234,212,0.6)] hover:scale-105 border-2 border-steam-cyber-neon-cyan/50',
      outline: 'bg-transparent border-2 border-steam-cyber-neon-cyan/50 text-steam-cyber-neon-cyan hover:bg-steam-cyber-neon-cyan/10 hover:border-steam-cyber-neon-cyan hover:shadow-[0_0_20px_rgba(85,234,212,0.4)]',
      ghost: 'bg-transparent text-steam-cyber-neon-cyan hover:bg-steam-cyber-neon-cyan/10 hover:text-steam-cyber-neon-cyan',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant === 'default' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
