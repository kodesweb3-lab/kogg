import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Transaction } from '@solana/web3.js';

interface ClaimCreatorFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional preselected token mint (e.g. from dashboard row) */
  preselectedMint?: string | null;
}

type Token = {
  mint: string;
  name: string;
  symbol: string;
  imageUrl?: string | null;
};

type FeeMetrics = {
  success: boolean;
  creatorBaseFee: string;
  creatorQuoteFee: string;
  partnerBaseFee: string;
  partnerQuoteFee: string;
};

export function ClaimCreatorFeesModal({
  isOpen,
  onClose,
  preselectedMint = null,
}: ClaimCreatorFeesModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const [selectedToken, setSelectedToken] = useState<string>(preselectedMint ?? '');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (preselectedMint) setSelectedToken(preselectedMint);
  }, [preselectedMint]);

  // Fetch only tokens created by the connected wallet
  const { data: tokensData, isLoading: isLoadingTokens } = useQuery<{
    success: boolean;
    data: Token[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ['my-tokens-for-creator-claim', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      const res = await fetch(
        `/api/tokens?creatorWallet=${encodeURIComponent(publicKey.toBase58())}&limit=100&sortBy=createdAt&sortOrder=desc`
      );
      if (!res.ok) throw new Error('Failed to fetch your tokens');
      return res.json();
    },
    enabled: isOpen && !!publicKey,
  });

  // Fetch creator fee metrics for the selected token
  const { data: feeMetrics, isLoading: isLoadingMetrics } = useQuery<FeeMetrics>({
    queryKey: ['pool-fee-metrics', selectedToken],
    queryFn: async () => {
      const res = await fetch(`/api/pool-fee-metrics?baseMint=${encodeURIComponent(selectedToken)}`);
      if (!res.ok) throw new Error('Failed to fetch fee metrics');
      return res.json();
    },
    enabled: isOpen && !!selectedToken,
  });

  const tokens = tokensData?.data ?? [];
  const hasCreatorFees =
    feeMetrics &&
    (BigInt(feeMetrics.creatorBaseFee) > 0n || BigInt(feeMetrics.creatorQuoteFee) > 0n);

  const handleClaim = async () => {
    if (!publicKey || !selectedToken) {
      toast.error('Please select a token');
      return;
    }

    if (!signTransaction) {
      toast.error('Wallet not connected. Please connect your wallet.');
      return;
    }

    if (!hasCreatorFees) {
      toast.error('No creator fees to claim for this token');
      return;
    }

    setIsSending(true);
    const toastId = 'claim-creator-fees';

    try {
      toast.loading('Creating claim transaction...', { id: toastId });
      const response = await fetch('/api/claim-creator-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseMint: selectedToken,
          creator: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create claim transaction');
      }

      const { claimTx: claimTxBase64 } = await response.json();
      const transaction = Transaction.from(Buffer.from(claimTxBase64, 'base64'));

      toast.loading('Please sign the transaction...', { id: toastId });
      const signedTx = await signTransaction(transaction);

      toast.loading('Sending transaction...', { id: toastId });
      const sendResponse = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTx.serialize().toString('base64'),
        }),
      });

      if (!sendResponse.ok) {
        const err = await sendResponse.json();
        throw new Error(err.error || 'Failed to send transaction');
      }

      const { signature } = await sendResponse.json();

      toast.success('Creator fees claimed successfully!', {
        id: toastId,
        description: `View on Solscan: https://solscan.io/tx/${signature}`,
      });
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to claim creator fees';
      toast.error(message, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const selectedTokenData = tokens.find((t) => t.mint === selectedToken);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/80">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-[var(--accent)]">
                  Claim Creator Fees
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

            <div className="p-6 space-y-6">
              {!publicKey ? (
                <div className="p-4 text-center text-[var(--text-muted)]">
                  Connect your wallet to see tokens you created and claim creator fees.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Your token
                    </label>
                    {isLoadingTokens ? (
                      <div className="p-4 text-center text-[var(--text-muted)]">
                        Loading your tokens...
                      </div>
                    ) : tokens.length === 0 ? (
                      <div className="p-4 text-center text-[var(--text-muted)]">
                        You have not created any tokens yet.
                      </div>
                    ) : (
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
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

                  {selectedTokenData && (
                    <div className="p-4 bg-[var(--bg-elevated)]/80 border border-[var(--accent)]/20 rounded-lg">
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

                  {selectedToken && (
                    <div className="p-4 bg-[var(--bg-elevated)]/50 border border-[var(--accent)]/20 rounded-lg">
                      {isLoadingMetrics ? (
                        <p className="text-sm text-[var(--text-muted)]">
                          Loading fee metrics...
                        </p>
                      ) : feeMetrics ? (
                        <div className="text-sm text-[var(--text-secondary)] space-y-1">
                          <p>
                            Creator fees available: base {feeMetrics.creatorBaseFee}, quote{' '}
                            {feeMetrics.creatorQuoteFee} (raw units).
                          </p>
                          {!hasCreatorFees && (
                            <p className="text-[var(--text-muted)]">
                              No creator fees to claim for this token yet.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">
                          Could not load fee metrics (pool may not exist yet).
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-[var(--bg-elevated)]/50 border border-[var(--accent)]/20 rounded-lg">
                    <p className="text-sm text-[var(--text-muted)]">
                      Claim your share of trading fees as the token creator. Fees will be sent to your
                      connected wallet. Only available when the pool config allocates a percentage to
                      creators (creatorTradingFeePercentage &gt; 0).
                    </p>
                  </div>
                </>
              )}
            </div>

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
                disabled={
                  !publicKey ||
                  !selectedToken ||
                  isSending ||
                  isLoadingTokens ||
                  !hasCreatorFees
                }
                className="bg-[var(--accent)] hover:opacity-90 text-[var(--bg-base)] font-heading font-bold"
              >
                {isSending ? 'Claiming...' : 'Claim Creator Fees'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
