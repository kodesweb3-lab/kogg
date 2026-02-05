import { useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReferralData = {
  referralCount: number;
  referralLink: string;
};

// Rank tiers based on referrals
function getRank(count: number): { name: string; icon: string; color: string; next: number } {
  if (count >= 50) return { name: 'Alpha Wolf', icon: '🐺', color: 'text-[var(--accent)]', next: 0 };
  if (count >= 25) return { name: 'Pack Leader', icon: '🔥', color: 'text-[var(--accent)]', next: 50 };
  if (count >= 10) return { name: 'Hunter', icon: '🎯', color: 'text-[var(--text-secondary)]', next: 25 };
  if (count >= 5) return { name: 'Scout', icon: '👁️', color: 'text-[var(--text-muted)]', next: 10 };
  if (count >= 1) return { name: 'Pup', icon: '🐕', color: 'text-[var(--accent)]', next: 5 };
  return { name: 'Lone Wolf', icon: '🌑', color: 'text-[var(--text-muted)]/80', next: 1 };
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ['referral', publicKey?.toBase58()],
    queryFn: async () => {
      const res = await fetch(`/api/referral?wallet=${publicKey?.toBase58()}`);
      if (!res.ok) throw new Error('Failed to fetch referral data');
      return res.json();
    },
    enabled: !!publicKey && isOpen,
  });

  const handleCopy = async () => {
    if (!data?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success('Link copied! Share it with friends!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = () => {
    if (!data?.referralLink) return;
    
    const text = `Join me on @KogaionSol - the Dacian Wolf token launchpad on Solana! 🐺\n\nLaunch tokens. Build your pack. Ascend together.`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.referralLink)}`;
    window.open(url, '_blank');
  };

  const count = data?.referralCount || 0;
  const rank = getRank(count);
  const progress = rank.next > 0 ? (count / rank.next) * 100 : 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-[var(--text-muted)]/80 hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Rank Badge */}
            <div className="text-center mb-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-5xl mb-2"
              >
                {rank.icon}
              </motion.div>
              <h2 className={`text-xl font-heading font-bold ${rank.color}`}>
                {rank.name}
              </h2>
              <p className="text-[var(--text-muted)]/80 font-body text-xs mt-1">
                Your Pack Rank
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mb-4 border border-[var(--border-default)]">
              <div className="text-center mb-3">
                <div className="text-4xl font-heading font-bold text-[var(--text-primary)]">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <motion.span
                      key={count}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
                <div className="text-sm text-[var(--text-muted)] font-body">
                  Pack Members Recruited
                </div>
              </div>

              {/* Progress to next rank */}
              {rank.next > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]/80 mb-1">
                    <span>Progress to {getRank(rank.next).name}</span>
                    <span>{count}/{rank.next}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-default)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Referral Link */}
            <div className="mb-4">
              <label className="block text-xs text-[var(--text-muted)]/80 font-body mb-2 uppercase tracking-wide">
                Your Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={data?.referralLink || 'Loading...'}
                  className="flex-1 px-3 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono text-xs truncate focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                <Button 
                  onClick={handleCopy} 
                  className="shrink-0 px-4"
                  variant={copied ? 'outline' : 'default'}
                >
                  {copied ? '✓' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <Button
              onClick={handleShare}
              className="w-full bg-[var(--accent)]/80 hover:bg-[var(--accent)] text-[var(--text-primary)] font-bold py-3"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </Button>

            {/* Rewards teaser */}
            <p className="text-center text-xs text-[var(--text-muted)]/80 mt-4 font-body">
              Rewards coming soon for top recruiters
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ReferralModal;
