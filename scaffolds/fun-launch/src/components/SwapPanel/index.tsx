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
          amountSol: amountNum,
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
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span>{mode === 'buy' ? 'Bought' : 'Sold'} successfully!</span>
          <a 
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ritual-amber-400 hover:underline"
          >
            View on Solscan
          </a>
        </div>,
        { id: toastId, duration: 5000 }
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
    <div className="bg-ritual-bgElevated rounded-xl p-4 border border-ritual-amber-500/20">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 px-4 rounded-lg font-heading font-bold transition-all ${
            mode === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-ritual-bgHover text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 px-4 rounded-lg font-heading font-bold transition-all ${
            mode === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-ritual-bgHover text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-body text-gray-400 mb-1">
          You {mode === 'buy' ? 'pay' : 'sell'}
        </label>
        <div className="flex items-center gap-2 bg-ritual-bgHover rounded-lg p-3 border border-ritual-amber-500/10">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.01"
            className="flex-1 bg-transparent text-xl font-body text-white outline-none"
            disabled={isSwapping}
          />
          <span className="text-gray-400 font-body font-medium">{inputLabel}</span>
        </div>
        {mode === 'buy' && (
          <div className="flex gap-2 mt-2">
            {[0.1, 0.5, 1, 2].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className="px-3 py-1 text-xs bg-ritual-bgHover rounded-md text-gray-400 hover:text-white hover:bg-ritual-amber-500/20 transition-all font-body"
              >
                {val} SOL
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-2">
        <div className="w-8 h-8 rounded-full bg-ritual-bgHover flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Output Estimate */}
      <div className="mb-4">
        <label className="block text-sm font-body text-gray-400 mb-1">
          You receive (estimate)
        </label>
        <div className="flex items-center gap-2 bg-ritual-bgHover rounded-lg p-3 border border-ritual-amber-500/10">
          {isLoadingQuote ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <span className="flex-1 text-xl font-body text-white">
              {quote ? parseFloat(quote).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.0'}
            </span>
          )}
          <span className="text-gray-400 font-body font-medium">{outputLabel}</span>
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
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
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
      <p className="text-xs text-gray-500 text-center mt-3 font-body">
        Trading directly on Meteora DBC
      </p>
    </div>
  );
}

export default SwapPanel;
