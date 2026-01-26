import React, { useState, useCallback } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { Transaction } from '@solana/web3.js';
import { toast } from 'sonner';

import { Pool, TokenListTimeframe } from '../Explore/types';

import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/Skeleton';
import { TrenchesPoolTokenIcon } from '../TokenIcon/TokenIcon';
import { Copyable } from '../ui/Copyable';
import CopyIconSVG from '@/icons/CopyIconSVG';
import { TokenAge } from '../TokenAge';
import { TokenSocials } from '../TokenSocials';
import { TokenCardMcapMetric, TokenCardVolumeMetric } from './TokenCardMetric';
import Link from 'next/link';
import { RWABadge, RWATypeBadge } from '@/components/RWABadge';

type TokenCardProps = {
  pool: Pool;
  timeframe: TokenListTimeframe;
  rowRef: (element: HTMLElement | null, poolId: string) => void;
};

export const TokenCard: React.FC<TokenCardProps> = ({ pool, timeframe, rowRef }) => {
  const stats = pool.baseAsset[`stats${timeframe}`];
  const { publicKey, signTransaction, connected } = useWallet();
  const [buyingAmount, setBuyingAmount] = useState<number | null>(null);

  const handleQuickBuy = useCallback(async (e: React.MouseEvent, amount: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setBuyingAmount(amount);
    const toastId = `quick-buy-${pool.baseAsset.id}-${amount}`;

    try {
      toast.loading(`Buying ${amount} SOL of ${pool.baseAsset.symbol}...`, { id: toastId });

      const swapResponse = await fetch('/api/swap-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mint: pool.baseAsset.id,
          amount,
          userWallet: publicKey.toBase58(),
          isBuy: true,
        }),
      });

      if (!swapResponse.ok) {
        const error = await swapResponse.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const { swapTx } = await swapResponse.json();
      const transaction = Transaction.from(Buffer.from(swapTx, 'base64'));

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
        const error = await sendResponse.json();
        throw new Error(error.error || 'Failed to send transaction');
      }

      const { signature } = await sendResponse.json();
      
      const tweetText = `I just bought $${pool.baseAsset.symbol} on @KogaionSol! Join the pack.`;
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`${window.location.origin}/token/${pool.baseAsset.id}`)}`;
      
      toast.success(
        <div className="flex flex-col gap-2">
          <span>Bought {pool.baseAsset.symbol}!</span>
          <div className="flex items-center gap-2">
            <a 
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mystic-steam-copper hover:underline"
            >
              Solscan
            </a>
            <span className="text-gray-500">|</span>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Share on X
            </a>
          </div>
        </div>,
        { id: toastId, duration: 8000 }
      );
    } catch (error) {
      console.error('Quick buy error:', error);
      toast.error(error instanceof Error ? error.message : 'Buy failed', { id: toastId });
    } finally {
      setBuyingAmount(null);
    }
  }, [publicKey, signTransaction, pool.baseAsset.id, pool.baseAsset.symbol]);

  return (
    <div
      ref={(el) => rowRef(el, pool.id)}
      data-pool-id={pool.id}
      className="relative flex cursor-pointer items-center border-mystic-steam-copper/20 py-3 pl-1.5 pr-2 text-xs has-hover:hover:bg-mystic-steam-ash/50 [&:nth-child(n+2)]:border-t hover:border-mystic-steam-copper/40 transition-all"
    >
      <div className="shrink-0 pl-2 pr-4">
        <TrenchesPoolTokenIcon width={54} height={54} pool={pool} />
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-1 overflow-hidden">
        {/* 1st row */}
        <div className="flex w-full items-center justify-between">
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-0.5 xl:gap-1">
              <div
                className="whitespace-nowrap text-sm font-semibold"
                title={pool.baseAsset.symbol}
              >
                {pool.baseAsset.symbol}
              </div>

              {/* RWA Badge */}
              {pool.baseAsset.tokenType === 'RWA' && (
                <RWATypeBadge className="ml-1" />
              )}

              <div className="ml-1 flex items-center gap-1 overflow-hidden z-10">
                <Copyable
                  name="Address"
                  copyText={pool.baseAsset.id}
                  className="z-[1] flex min-w-0 items-center gap-0.5 text-[0.625rem] leading-none text-neutral-500 duration-500 hover:text-neutral-200 data-[copied=true]:text-primary"
                >
                  {(copied) => (
                    <>
                      <div className="truncate text-xs" title={pool.baseAsset.name}>
                        {pool.baseAsset.name}
                      </div>
                      {copied ? (
                        <div className="iconify h-3 w-3 shrink-0 text-primary ph--check-bold" />
                      ) : (
                        <CopyIconSVG className="h-3 w-3 shrink-0" width={12} height={12} />
                      )}
                    </>
                  )}
                </Copyable>
              </div>
            </div>
          </div>

          {/* Quick Buy Buttons */}
          {connected && (
            <div className="flex items-center gap-1 z-10 ml-2">
              {[0.1, 0.5, 1].map((amount) => (
                <button
                  key={amount}
                  onClick={(e) => handleQuickBuy(e, amount)}
                  disabled={buyingAmount !== null}
                  className={cn(
                    "px-2 py-1 text-[10px] font-medium rounded transition-all",
                    "bg-green-600/80 hover:bg-green-500 text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    buyingAmount === amount && "animate-pulse"
                  )}
                >
                  {buyingAmount === amount ? '...' : `${amount}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2nd row */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TokenAge className="opacity-80" date={pool.createdAt} />
            <TokenSocials className="z-[1]" token={pool.baseAsset} />
            {/* Asset Type Badge for RWA */}
            {pool.baseAsset.tokenType === 'RWA' && pool.baseAsset.assetType && (
              <RWABadge assetType={pool.baseAsset.assetType} size="sm" />
            )}
            {/* Asset Value for RWA */}
            {pool.baseAsset.tokenType === 'RWA' && pool.baseAsset.assetValue && (
              <span className="text-xs text-mystic-steam-parchment/60 font-body">
                ${pool.baseAsset.assetValue.toLocaleString()}
              </span>
            )}
          </div>

          {/* Token metric */}
          <div className="flex items-center gap-2.5">
            <TokenCardVolumeMetric buyVolume={stats?.buyVolume} sellVolume={stats?.sellVolume} />
            <TokenCardMcapMetric mcap={pool.baseAsset.mcap} />
          </div>
        </div>
      </div>

      <Link
        className="absolute inset-0 cursor-pointer rounded-lg"
        href={`/token/${pool.baseAsset.id}`}
      />
    </div>
  );
};

type TokenCardSkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export const TokenCardSkeleton: React.FC<TokenCardSkeletonProps> = ({ className, ...props }) => (
  <div className={cn('border-b border-neutral-925 py-3 pl-1.5 pr-2 text-xs', className)} {...props}>
    <div className="flex items-center">
      {/* Icon */}
      <div className="shrink-0 pl-2 pr-4">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>

      {/* Info */}
      <div className="flex w-full flex-col gap-2 overflow-hidden">
        {/* 1st row */}
        <div className="flex w-full items-center justify-between gap-1">
          {/* Left side: Symbol, Name, Icons, Metrics */}
          <div className="flex flex-col gap-1 overflow-hidden">
            {/* Symbol/Name/Icons */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-16" /> {/* Symbol */}
            </div>
            {/* Metrics */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Right side: Quickbuy */}
          <div className="shrink-0">
            <Skeleton className="h-6 w-6 rounded-full lg:w-12" />
          </div>
        </div>

        {/* 2nd row */}
        <div className="flex w-full items-center justify-between">
          {/* Left side: Age, Socials */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-10" />
          </div>

          {/* Right side: Volume, MC */}
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-5 w-10" /> {/* V */}
            <Skeleton className="h-5 w-10" /> {/* MC */}
          </div>
        </div>
      </div>
    </div>
  </div>
);
