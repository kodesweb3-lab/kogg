import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReferralData = {
  referralCount: number;
  referralLink: string;
};

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
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = () => {
    if (!data?.referralLink) return;
    
    const text = `Join me on @KogaionSol - the Dacian Wolf token launchpad on Solana! 🐺`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.referralLink)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-ritual-bgElevated border border-ritual-amber-500/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🐺</div>
          <h2 className="text-2xl font-heading font-bold text-ritual-amber-400 mb-2">
            Invite to the Pack
          </h2>
          <p className="text-gray-400 font-body text-sm">
            Share your referral link and grow the pack together
          </p>
        </div>

        {/* Stats */}
        <div className="bg-ritual-bgHover rounded-lg p-4 mb-4 text-center">
          <div className="text-3xl font-heading font-bold text-white">
            {isLoading ? '...' : data?.referralCount || 0}
          </div>
          <div className="text-sm text-gray-400 font-body">Pack members invited</div>
        </div>

        {/* Referral Link */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 font-body mb-2">Your referral link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={data?.referralLink || '...'}
              className="flex-1 px-3 py-2 bg-ritual-bgHover border border-ritual-amber-500/10 rounded-lg text-white font-mono text-sm truncate"
            />
            <Button onClick={handleCopy} className="shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Share on X
        </Button>
      </div>
    </div>
  );
}

export default ReferralModal;
