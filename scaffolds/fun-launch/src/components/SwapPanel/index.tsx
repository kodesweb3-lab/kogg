import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { Transaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/Skeleton';

interface SwapPanelProps {
  mint: string;
  tokenSymbol?: string;
}

type SwapMode = 'buy' | 'sell';

export function SwapPanel({ mint, tokenSymbol = 'TOKEN' }: SwapPanelProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  const [mode, setMode] = useState<SwapMode>('buy');
  const [amount, setAmount] = useState<string>('');
  const [quote, setQuote] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch token balance when wallet connects or mode changes
  useEffect(() => {
    if (!publicKey || !mint) {
      setTokenBalance('0');
      return;
    }

    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const response = await fetch('/api/token-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mint,
            wallet: publicKey.toBase58(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTokenBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [publicKey, mint, mode]);

  // Debounced quote fetch
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingQuote(true);
      try {
        const response = await fetch('/api/swap-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mint,
            amount: parseFloat(amount),
            isBuy: mode === 'buy',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setQuote(data.estimatedOutput);
        } else {
          setQuote(null);
        }
      } catch (error) {
        console.error('Quote error:', error);
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, mode, mint]);

  const handleSwap = useCallback(async () => {
    if (!publicKey || !signTransaction || !amount) {
      toast.error('Please connect your wallet and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (mode === 'buy' && amountNum > 10) {
      toast.error('Maximum buy amount is 10 SOL');
      return;
    }

    setIsSwapping(true);
    const toastId = mode === 'buy' ? 'swap-buy' : 'swap-sell';

    try {
      // Step 1: Get swap transaction
      toast.loading(`Creating ${mode} transaction...`, { id: toastId });
      
      const swapResponse = await fetch('/api/swap-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint,
          amount: amountNum,
          userWallet: publicKey.toBase58(),
          isBuy: mode === 'buy',
        }),
      });

      if (!swapResponse.ok) {
        const error = await swapResponse.json();
        throw new Error(error.error || 'Failed to create swap transaction');
      }

      const { swapTx } = await swapResponse.json();
      const transaction = Transaction.from(Buffer.from(swapTx, 'base64'));

      // Step 2: Sign transaction
      toast.loading('Please sign the transaction...', { id: toastId });
      const signedTx = await signTransaction(transaction);

      // Step 3: Send transaction
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
      
      const tweetText = mode === 'buy' 
        ? `I just bought $${tokenSymbol} on @KogaionSol! Join the pack.`
        : `I just sold $${tokenSymbol} on @KogaionSol!`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.href)}`;
      
      toast.success(
        <div className="flex flex-col gap-2">
          <span>{mode === 'buy' ? 'Bought' : 'Sold'} successfully!</span>
          <div className="flex items-center gap-2">
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Solscan
            </a>
            <span className="text-gray-500">|</span>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Share on X
            </a>
          </div>
        </div>,
        { id: toastId, duration: 8000 }
      );

      // Reset form
      setAmount('');
      setQuote(null);

    } catch (error) {
      console.error('Swap error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Swap failed',
        { id: toastId }
      );
    } finally {
      setIsSwapping(false);
    }
  }, [publicKey, signTransaction, amount, mode, mint]);

  const inputLabel = mode === 'buy' ? 'SOL' : tokenSymbol;
  const outputLabel = mode === 'buy' ? tokenSymbol : 'SOL';

  return (
    <div className="bg-[var(--bg-layer)] rounded-xl p-4 border border-[var(--border-default)]">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 px-4 rounded-lg font-heading font-bold transition-all ${
            mode === 'buy'
              ? 'bg-[var(--accent)]/90 text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 px-4 rounded-lg font-heading font-bold transition-all ${
            mode === 'sell'
              ? 'bg-[var(--accent)]/90 text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-body text-[var(--text-muted)] mb-1">
          You {mode === 'buy' ? 'pay' : 'sell'}
        </label>
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-default)]">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.01"
            className="flex-1 bg-transparent text-xl font-body text-[var(--text-primary)] outline-none"
            disabled={isSwapping}
          />
          <span className="text-[var(--text-muted)] font-body font-medium">{inputLabel}</span>
        </div>
        {mode === 'buy' ? (
          <div className="flex gap-2 mt-2">
            {[0.1, 0.5, 1, 2].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className="px-3 py-1 text-xs bg-[var(--bg-elevated)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/20 border border-[var(--border-default)] transition-all font-body"
              >
                {val} SOL
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-body">
              <span>Balance:</span>
              {isLoadingBalance ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="text-[var(--text-primary)]">
                  {parseFloat(tokenBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {[25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const bal = parseFloat(tokenBalance);
                    if (bal > 0) {
                      setAmount(((bal * pct) / 100).toString());
                    }
                  }}
                  className="px-2 py-1 text-xs bg-[var(--bg-elevated)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/20 border border-[var(--border-default)] transition-all font-body"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-2">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Output Estimate */}
      <div className="mb-4">
        <label className="block text-sm font-body text-[var(--text-muted)] mb-1">
          You receive (estimate)
        </label>
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-default)]">
          {isLoadingQuote ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <span className="flex-1 text-xl font-body text-[var(--text-primary)]">
              {quote ? parseFloat(quote).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.0'}
            </span>
          )}
          <span className="text-[var(--text-muted)] font-body font-medium">{outputLabel}</span>
        </div>
      </div>

      {/* Swap Button */}
      {!connected ? (
        <Button
          className="w-full py-3 text-lg font-heading"
          variant="default"
          disabled
        >
          Connect Wallet
        </Button>
      ) : (
        <Button
          onClick={handleSwap}
          disabled={isSwapping || !amount || parseFloat(amount) <= 0}
          className={`w-full py-3 text-lg font-heading ${
            mode === 'buy' 
              ? 'bg-[var(--accent)] hover:opacity-90' 
              : 'bg-[var(--accent)]/80 hover:opacity-90'
          }`}
        >
          {isSwapping ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
          )}
        </Button>
      )}

      {/* Info */}
      <p className="text-xs text-[var(--text-primary)]/50 text-center mt-3 font-body">
        Trading directly on Meteora DBC
      </p>
    </div>
  );
}

export default SwapPanel;
