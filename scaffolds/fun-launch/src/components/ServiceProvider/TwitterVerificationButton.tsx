'use client';

import { useState } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TwitterVerificationButtonProps {
  serviceProviderId: string;
  onVerified?: () => void;
}

export function TwitterVerificationButton({
  serviceProviderId,
  onVerified,
}: TwitterVerificationButtonProps) {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [tweetMessage, setTweetMessage] = useState<string | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [extractedData, setExtractedData] = useState<{ handle: string; tweetId: string } | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Parse tweet URL to extract handle and tweet ID
  const parseTweetUrl = (url: string): { handle: string; tweetId: string } | null => {
    // Match patterns:
    // x.com/username/status/TWEET_ID
    // twitter.com/username/status/TWEET_ID
    // www.x.com/username/status/TWEET_ID
    // https://x.com/username/status/TWEET_ID
    const match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)\/status\/(\d+)/i);
    if (match) {
      return {
        handle: match[1].replace('@', '').trim(),
        tweetId: match[2].trim(),
      };
    }
    return null;
  };

  const handleUrlChange = (url: string) => {
    setTweetUrl(url);
    const parsed = parseTweetUrl(url);
    setExtractedData(parsed);
  };

  const handleInitVerification = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/twitter/init-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceProviderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize verification');
      }

      const data = await response.json();
      setVerificationCode(data.verificationCode);
      setTweetMessage(data.tweetMessage);
      setVerificationId(data.verificationId);
      
      // Automatically open Twitter with pre-filled message
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.tweetMessage)}`;
      window.open(twitterUrl, '_blank');
      
      toast.success('Twitter opened! Post the tweet, then paste the URL below.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!tweetUrl.trim()) {
      toast.error('Please paste the tweet URL');
      return;
    }

    if (!extractedData) {
      toast.error('Invalid tweet URL. Please paste a valid Twitter/X tweet URL');
      return;
    }

    if (!verificationId) {
      toast.error('Verification not initialized. Please try again.');
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/twitter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          tweetId: extractedData.tweetId,
          twitterHandle: extractedData.handle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify');
      }

      toast.success('Verification completed successfully!');
      setVerificationCode(null);
      setTweetMessage(null);
      setTweetUrl('');
      setExtractedData(null);
      setVerificationId(null);
      onVerified?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify');
    } finally {
      setIsChecking(false);
    }
  };

  if (verificationCode && tweetMessage) {
    return (
      <div className="space-y-4 p-4 steel-panel rounded-lg">
        <div>
          <p className="text-sm text-mystic-steam-parchment/70 mb-2">
            Tweet posted? Paste the URL below to verify:
          </p>
          <div className="p-3 bg-dacian-steel-dark rounded border border-dacian-steel-steel/30 mb-3">
            <p className="text-xs text-mystic-steam-parchment/60 mb-1">Verification Code:</p>
            <p className="text-sm font-mono text-mystic-steam-copper font-bold">
              {verificationCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetMessage)}`;
              window.open(twitterUrl, '_blank');
            }}
            className="text-sm text-dacian-steel-copper hover:text-dacian-steel-copper-light underline"
          >
            Open Twitter again →
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-mystic-steam-parchment/70 mb-2">
              Paste Your Tweet URL
            </label>
            <input
              type="text"
              value={tweetUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://x.com/username/status/1234567890"
              className="w-full min-h-[44px] px-3 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
            />
            <p className="text-xs text-mystic-steam-parchment/50 mt-1">
              After posting the tweet above, copy its URL and paste it here
            </p>
            {extractedData && (
              <div className="mt-2 p-2 bg-dacian-steel-dark/50 rounded border border-dacian-steel-copper/30">
                <p className="text-xs text-mystic-steam-parchment/70 mb-1">Detected:</p>
                <p className="text-sm text-mystic-steam-copper font-mono">@{extractedData.handle}</p>
                <p className="text-xs text-mystic-steam-parchment/50 font-mono">Tweet ID: {extractedData.tweetId}</p>
              </div>
            )}
            {tweetUrl && !extractedData && (
              <p className="text-xs text-red-400 mt-1">
                Invalid URL format. Please paste a valid Twitter/X tweet URL
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={isChecking || !extractedData || !tweetUrl.trim()}
            className="min-h-[44px]"
          >
            {isChecking ? 'Verifying...' : 'Verify Tweet'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setVerificationCode(null);
              setTweetMessage(null);
              setTweetUrl('');
              setExtractedData(null);
              setVerificationId(null);
            }}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button onClick={handleInitVerification} disabled={isLoading || !publicKey}>
      {isLoading ? 'Initializing...' : 'Verify with X'}
    </Button>
  );
}
