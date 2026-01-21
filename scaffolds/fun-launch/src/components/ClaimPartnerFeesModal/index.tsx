import { useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Connection, Transaction } from '@solana/web3.js';
import { useSendTransaction } from '@/hooks/useSendTransaction';

interface ClaimPartnerFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Token = {
  mint: string;
  name: string;
  symbol: string;
  imageUrl?: string | null;
};

export function ClaimPartnerFeesModal({ isOpen, onClose }: ClaimPartnerFeesModalProps) {
  const { publicKey } = useWallet();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const { sendTransaction, isLoading: isSending } = useSendTransaction();

  // Fetch all tokens from database
  const { data: tokensData, isLoading: isLoadingTokens } = useQuery<{
    success: boolean;
    data: Token[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ['all-tokens-for-claim'],
    queryFn: async () => {
      const res = await fetch('/api/tokens?limit=1000&sortBy=createdAt&sortOrder=desc');
      if (!res.ok) throw new Error('Failed to fetch tokens');
      return res.json();
    },
    enabled: isOpen,
  });

  const tokens = tokensData?.data || [];

  const handleClaim = async () => {
    if (!publicKey || !selectedToken) {
      toast.error('Please select a token');
      return;
    }

    try {
      // Fetch claim transaction from API
      const response = await fetch('/api/claim-partner-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseMint: selectedToken,
          feeClaimer: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create claim transaction');
      }

      const { claimTx: claimTxBase64 } = await response.json();

      // Deserialize transaction
      // Use mainnet RPC - in production this should come from env or wallet adapter
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcUrl, 'confirmed');
      const claimTx = Transaction.from(Buffer.from(claimTxBase64, 'base64'));

      // Send transaction
      const signature = await sendTransaction(claimTx, connection, {
        onSuccess: (sig) => {
          toast.success('Partner fees claimed successfully!');
          onClose();
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error(`Failed to claim fees: ${errorMessage}`);
        },
      });

      if (signature) {
        toast.success('Transaction sent!', {
          description: `View on Solscan: https://solscan.io/tx/${signature}`,
        });
      }
    } catch (error: any) {
      console.error('Error claiming partner fees:', error);
      toast.error(error.message || 'Failed to claim partner fees');
    }
  };

  const selectedTokenData = tokens.find((t) => t.mint === selectedToken);

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-mystic-steam-charcoal border border-mystic-steam-copper/30 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-mystic-steam-copper/30 bg-mystic-steam-ash/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-mystic-steam-copper">
                  Claim Partner Fees
                </h2>
                <button
                  onClick={onClose}
                  className="text-mystic-steam-parchment/60 hover:text-mystic-steam-parchment transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-medium text-mystic-steam-parchment mb-2">
                  Select Token
                </label>
                {isLoadingTokens ? (
                  <div className="p-4 text-center text-mystic-steam-parchment/60">
                    Loading tokens...
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="p-4 text-center text-mystic-steam-parchment/60">
                    No tokens found
                  </div>
                ) : (
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-2 bg-mystic-steam-ash border border-mystic-steam-copper/30 rounded-lg text-mystic-steam-parchment focus:outline-none focus:border-mystic-steam-copper focus:ring-1 focus:ring-mystic-steam-copper"
                  >
                    <option value="">-- Select a token --</option>
                    {tokens.map((token) => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Token Info */}
              {selectedTokenData && (
                <div className="p-4 bg-mystic-steam-ash/50 border border-mystic-steam-copper/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedTokenData.imageUrl && (
                      <img
                        src={selectedTokenData.imageUrl}
                        alt={selectedTokenData.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-heading font-bold text-mystic-steam-copper">
                        {selectedTokenData.symbol}
                      </div>
                      <div className="text-sm text-mystic-steam-parchment/70">
                        {selectedTokenData.name}
                      </div>
                      <div className="text-xs text-mystic-steam-parchment/50 font-mono mt-1">
                        {selectedTokenData.mint.slice(0, 8)}...{selectedTokenData.mint.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-mystic-steam-ash/30 border border-mystic-steam-copper/20 rounded-lg">
                <p className="text-sm text-mystic-steam-parchment/70">
                  This will claim all available partner trading fees for the selected token. Fees
                  will be sent to your connected wallet.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-mystic-steam-copper/30 bg-mystic-steam-ash/50 flex items-center justify-end gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-mystic-steam-copper/30 text-mystic-steam-parchment hover:bg-mystic-steam-ash"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClaim}
                disabled={!selectedToken || isSending || isLoadingTokens}
                className="bg-mystic-steam-copper hover:bg-mystic-steam-copper/90 text-mystic-steam-charcoal font-heading font-bold"
              >
                {isSending ? 'Claiming...' : 'Claim Fees'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
