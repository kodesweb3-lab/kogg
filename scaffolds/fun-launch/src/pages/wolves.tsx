import { motion } from 'framer-motion';
import Page from '@/components/ui/Page/Page';

export default function WolvesPage() {
  return (
    <Page>
      <div className="min-h-screen text-[var(--text-primary)] py-12 md:py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-bold tracking-widest text-[var(--text-primary)] mb-4"
          >
            Community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[var(--text-muted)] font-body mb-10"
          >
            Join the conversation and stay updated.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://t.me/kogaionpack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-[var(--cyber-accent)]/50 text-[var(--cyber-accent)] font-heading font-semibold uppercase tracking-wider hover:bg-[var(--cyber-accent)]/10 transition-colors"
            >
              Telegram
            </a>
            <a
              href="https://x.com/KogaionSol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-[var(--cyber-accent)]/50 text-[var(--cyber-accent)] font-heading font-semibold uppercase tracking-wider hover:bg-[var(--cyber-accent)]/10 transition-colors"
            >
              X (Twitter)
            </a>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
