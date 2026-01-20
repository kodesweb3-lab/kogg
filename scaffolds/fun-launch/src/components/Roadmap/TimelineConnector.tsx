import { motion } from 'framer-motion';

interface TimelineConnectorProps {
  isActive?: boolean;
  isLast?: boolean;
  className?: string;
}

export function TimelineConnector({ isActive = false, isLast = false, className }: TimelineConnectorProps) {
  if (isLast) return null;

  return (
    <div className={className || 'flex items-center justify-center my-4'}>
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`
          w-0.5 h-12 md:h-16
          ${isActive ? 'bg-gradient-to-b from-steam-cyber-neon-cyan to-steam-cyber-neon-cyan/30' : 'bg-steam-cyber-neon-cyan/20'}
          relative
        `}
      >
        {/* Glow effect */}
        {isActive && (
          <motion.div
            animate={{
              boxShadow: [
                '0 0 10px rgba(85, 234, 212, 0.5)',
                '0 0 20px rgba(85, 234, 212, 0.8)',
                '0 0 10px rgba(85, 234, 212, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0"
          />
        )}

        {/* Node */}
        <motion.div
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            absolute -left-2 top-1/2 -translate-y-1/2
            w-4 h-4 rounded-full
            ${isActive ? 'bg-steam-cyber-neon-cyan' : 'bg-steam-cyber-neon-cyan/30'}
            border-2 border-steam-cyber-bg
          `}
        />
      </motion.div>
    </div>
  );
}
