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
  const [tweetId, setTweetId] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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
      toast.success('Verification code generated! Please post the tweet.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!tweetId.trim()) {
      toast.error('Please enter the tweet ID');
      return;
    }

    if (!twitterHandle.trim()) {
      toast.error('Please enter your Twitter handle');
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
          tweetId: tweetId.trim(),
          twitterHandle: twitterHandle.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify');
      }

      toast.success('Verification completed successfully!');
      setVerificationCode(null);
      setTweetMessage(null);
      setTweetId('');
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
            Please post this tweet on your Twitter account:
          </p>
          <div className="p-3 bg-dacian-steel-dark rounded border border-dacian-steel-steel/30">
            <p className="text-sm text-mystic-steam-parchment whitespace-pre-wrap">
              {tweetMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetMessage)}`;
              window.open(twitterUrl, '_blank');
            }}
            className="mt-2 text-sm text-dacian-steel-copper hover:text-dacian-steel-copper-light"
          >
            Open Twitter to post →
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-mystic-steam-parchment/70 mb-2">
              Twitter Handle
            </label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@username or username"
              className="w-full px-3 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-mystic-steam-parchment/70 mb-2">
              Tweet ID (from the tweet URL):
            </label>
            <input
              type="text"
              value={tweetId}
              onChange={(e) => setTweetId(e.target.value)}
              placeholder="e.g., 1234567890123456789"
              className="w-full px-3 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
            />
            <p className="text-xs text-mystic-steam-parchment/50 mt-1">
              Find the tweet ID in the URL: x.com/username/status/[TWEET_ID]
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleVerify} disabled={isChecking || !tweetId.trim() || !twitterHandle.trim()}>
            {isChecking ? 'Verifying...' : 'Verify Tweet'}
          </Button>
          <Button variant="outline" onClick={() => {
            setVerificationCode(null);
            setTweetMessage(null);
            setTweetId('');
            setTwitterHandle('');
            setVerificationId(null);
          }}>
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
