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
          ${isActive ? 'bg-[var(--accent)]/50' : 'bg-[var(--accent)]/20'}
          relative
        `}
      >
        {/* Node */}
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`
            absolute -left-2 top-1/2 -translate-y-1/2
            w-4 h-4 rounded-full
            ${isActive ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]/30'}
            border-2 border-[var(--bg-base)]
          `}
        />
      </motion.div>
    </div>
  );
}
