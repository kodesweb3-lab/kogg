'use client';

import { useTokenInfo } from '@/hooks/queries';
import { useTokenAddress } from '@/hooks/queries';
import { Button } from './ui/button';

export function TokenShareButtons() {
  const tokenId = useTokenAddress();
  const { data: tokenName } = useTokenInfo((data) => data?.baseAsset.name);
  const { data: tokenSymbol } = useTokenInfo((data) => data?.baseAsset.symbol);

  if (!tokenId || !tokenName || !tokenSymbol) {
    return null;
  }

  const tokenUrl = typeof window !== 'undefined' ? `${window.location.origin}/token/${tokenId}` : '';
  const tweetText = encodeURIComponent(
    `Check out ${tokenName} ($${tokenSymbol}) on @KogaionSol! 🐺\n\n${tokenUrl}`
  );
  const telegramText = encodeURIComponent(
    `Check out ${tokenName} ($${tokenSymbol}) on Kogaion!\n${tokenUrl}`
  );

  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(tokenUrl)}&text=${telegramText}`;

  return (
    <div className="flex gap-2">
      <Button
        as="a"
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </Button>
      <Button
        as="a"
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15.056-.22.06-.13.16-.2.27-.2.106 0 .171.008.242.054.112.07.161.18.222.31.08.18.193.44.282.63.087.15.173.31.24.42.056.096.111.22.027.34-.09.15-.135.24-.27.38-.27.27-.53.53-.727.72-.246.24-.42.41-.57.66-.12.2-.214.41-.18.66.05.4.22.78.48 1.08.42.5.93.8 1.52.98.38.13.73.17 1.05.11.38-.07.74-.25 1.06-.48.41-.3.92-.67 1.52-1.08.9-.62 1.58-1 2.27-1.61.19-.16.38-.33.55-.5.28-.27.5-.5.68-.68.14-.14.27-.28.38-.42.12-.15.2-.3.15-.45-.05-.15-.2-.24-.35-.3z" />
        </svg>
        Share on Telegram
      </Button>
    </div>
  );
}
