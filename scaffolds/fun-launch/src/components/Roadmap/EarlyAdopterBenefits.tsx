import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Benefit {
  title: string;
  description: string;
  icon: string;
  slots?: { total: number; remaining: number };
}

const benefits: Benefit[] = [
  {
    title: 'Free Boost',
    description: 'Featured listing & priority in discover',
    icon: '🚀',
    slots: { total: 50, remaining: 0 },
  },
  {
    title: 'Revenue Share',
    description: '50% revenue share (future program)',
    icon: '💰',
    slots: { total: 20, remaining: 0 },
  },
  {
    title: 'Founder NFT Badge',
    description: 'Exclusive "Founder Token" NFT badge',
    icon: '🏆',
    slots: { total: 10, remaining: 0 },
  },
  {
    title: 'Lifetime Benefits',
    description: 'Permanent access to premium features',
    icon: '⭐',
  },
  {
    title: 'Marketing Support',
    description: 'Promotion on social media',
    icon: '📢',
  },
];

function useEarlyAdopterStats() {
  return useQuery({
    queryKey: ['early-adopter-stats'],
    queryFn: async () => {
      const res = await fetch('/api/tokens?limit=1&sortBy=createdAt&sortOrder=asc');
      if (!res.ok) return { totalTokens: 0 };
      const data = await res.json();
      return { totalTokens: data.pagination?.total || 0 };
    },
    refetchInterval: 30000,
  });
}

export function EarlyAdopterBenefits() {
  const { data: stats } = useEarlyAdopterStats();
  const totalTokens = stats?.totalTokens || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
    >
      {/* Header */}
      <div className="relative z-10 mb-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-[var(--accent)]">
          First Pack Benefits
        </h2>
        <p className="text-[var(--text-muted)] font-body">
          Exclusive rewards for early token creators
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {benefits.map((benefit, index) => {
          const slotsRemaining = benefit.slots
            ? Math.max(0, benefit.slots.total - totalTokens)
            : null;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-4 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{benefit.icon}</span>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-[var(--text-primary)] mb-1">{benefit.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-body mb-2">{benefit.description}</p>
                  {slotsRemaining !== null && (
                    <div className="text-xs font-body">
                      <span className="text-[var(--accent)]">
                        {slotsRemaining}/{benefit.slots!.total} slots
                      </span>
                      {slotsRemaining === 0 && (
                        <span className="text-[var(--text-muted)]/80 ml-2">(Full)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="relative z-10 text-center">
        <Link href="/create-pool">
          <Button className="bg-[var(--accent)] hover:opacity-90 text-[var(--bg-base)] font-heading font-bold px-8 py-3 transition-all">
            Launch Now to Claim Benefits
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
