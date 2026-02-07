import { useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Transaction } from '@solana/web3.js';

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
  const { publicKey, signTransaction } = useWallet();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

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
      // Fetch tokens with pagination - API allows max 100 per request
      const res = await fetch('/api/tokens?limit=100&sortBy=createdAt&sortOrder=desc');
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

    if (!signTransaction) {
      toast.error('Wallet not connected. Please connect your wallet.');
      return;
    }

    setIsSending(true);
    const toastId = 'claim-fees';

    try {
      // Step 1: Fetch claim transaction from API (already prepared with blockhash server-side)
      toast.loading('Creating claim transaction...', { id: toastId });
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
      const transaction = Transaction.from(Buffer.from(claimTxBase64, 'base64'));

      // Step 2: Sign transaction with wallet
      toast.loading('Please sign the transaction...', { id: toastId });
      const signedTx = await signTransaction(transaction);

      // Step 3: Send transaction via API route (uses server-side RPC)
      toast.loading('Sending transaction...', { id: toastId });
      const sendResponse = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTx.serialize().toString('base64'),
        }),
      });

      if (!sendResponse.ok) {
        const error = await sendResponse.json();
        throw new Error(error.error || 'Failed to send transaction');
      }

      const { signature } = await sendResponse.json();

      toast.success('Partner fees claimed successfully!', {
        id: toastId,
        description: `View on Solscan: https://solscan.io/tx/${signature}`,
      });
      onClose();
    } catch (error: any) {
      console.error('Error claiming partner fees:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim partner fees';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSending(false);
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
            className="relative w-full max-w-2xl bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-glow-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/80">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-[var(--accent)]">
                  Claim Partner Fees
                </h2>
                <button
                  onClick={onClose}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Select Token
                </label>
                {isLoadingTokens ? (
                  <div className="p-4 text-center text-[var(--text-muted)]">
                    Loading tokens...
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="p-4 text-center text-[var(--text-muted)]">
                    No tokens found
                  </div>
                ) : (
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
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
                <div className="p-4 bg-[var(--bg-elevated)]/80 border border-[var(--accent)]/20 rounded-[var(--radius-md)]">
                  <div className="flex items-center gap-3">
                    {selectedTokenData.imageUrl && (
                      <img
                        src={selectedTokenData.imageUrl}
                        alt={selectedTokenData.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-heading font-bold text-[var(--accent)]">
                        {selectedTokenData.symbol}
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {selectedTokenData.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]/80 font-mono mt-1">
                        {selectedTokenData.mint.slice(0, 8)}...{selectedTokenData.mint.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-[var(--bg-elevated)]/50 border border-[var(--accent)]/20 rounded-[var(--radius-md)]">
                <p className="text-sm text-[var(--text-muted)]">
                  This will claim all available partner trading fees for the selected token. Fees
                  will be sent to your connected wallet.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-elevated)]/80 flex items-center justify-end gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClaim}
                disabled={!selectedToken || isSending || isLoadingTokens}
                className="hover:opacity-90 text-[var(--bg-base)] font-heading font-bold"
                style={{background:'var(--gradient-primary)'}}
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
