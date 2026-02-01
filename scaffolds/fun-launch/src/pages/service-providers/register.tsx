'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';
import Page from '@/components/ui/Page/Page';
import { Button } from '@/components/ui/button';
import { TagSelector } from '@/components/ServiceProvider/TagSelector';
import { TwitterVerificationButton } from '@/components/ServiceProvider/TwitterVerificationButton';
import { motion } from 'framer-motion';

export default function ServiceProviderRegisterPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (tags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          email: email.trim() || undefined,
          telegram: telegram.trim() || undefined,
          twitterHandle: twitterHandle.trim() || undefined,
          description: description.trim() || undefined,
          tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }

      const data = await response.json();
      setServiceProviderId(data.serviceProvider.id);
      toast.success('Registration successful! Now verify your Twitter account.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerified = () => {
    setIsVerified(true);
    toast.success('Verification complete! Redirecting to marketplace...');
    setTimeout(() => {
      router.push('/service-providers');
    }, 2000);
  };

  if (isVerified) {
    return (
      <Page>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="steel-panel rounded-xl p-8"
            >
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-heading font-bold text-mystic-steam-copper mb-4">
                Verification Complete!
              </h1>
              <p className="text-mystic-steam-parchment/70 mb-6">
                Your service provider profile has been verified and is now live on the marketplace.
              </p>
              <Button onClick={() => router.push('/service-providers')}>
                Go to Marketplace
              </Button>
            </motion.div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-heading font-bold text-mystic-steam-copper mb-4">
              Register as Service Provider
            </h1>
            <p className="text-mystic-steam-parchment/70">
              Join the Kogaion marketplace and connect with token creators. Showcase your services
              and grow your network.
            </p>
          </motion.div>

          {!connected ? (
            <div className="steel-panel rounded-xl p-8 text-center">
              <p className="text-mystic-steam-parchment/70 mb-4">
                Please connect your Solana wallet to continue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="steel-panel rounded-xl p-6">
                <h2 className="text-xl font-heading font-bold text-mystic-steam-copper mb-4">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={publicKey?.toBase58() || ''}
                      disabled
                      className="w-full px-4 py-2 bg-dacian-steel-dark border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment/50 font-mono text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                      Email <span className="text-mystic-steam-parchment/40">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                      Telegram <span className="text-mystic-steam-parchment/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username or username"
                      className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                      Twitter Handle <span className="text-mystic-steam-parchment/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@username or username"
                      className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-2">
                      Description <span className="text-mystic-steam-parchment/40">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your services and expertise..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper resize-none"
                    />
                    <p className="text-xs text-mystic-steam-parchment/50 mt-1">
                      {description.length} / 500 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="steel-panel rounded-xl p-6">
                <h2 className="text-xl font-heading font-bold text-mystic-steam-copper mb-4">
                  Services & Tags
                </h2>
                <p className="text-sm text-mystic-steam-parchment/60 mb-4">
                  Select tags that describe your services. You can choose from predefined tags or
                  create custom ones.
                </p>
                <TagSelector selectedTags={tags} onTagsChange={setTags} maxTags={10} />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting || tags.length === 0} variant="steel">
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/service-providers')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {serviceProviderId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 steel-panel rounded-xl p-6"
            >
              <h2 className="text-xl font-heading font-bold text-mystic-steam-copper mb-4">
                Verify Your Twitter Account
              </h2>
              <p className="text-sm text-mystic-steam-parchment/70 mb-4">
                Verify your Twitter account to get a verified badge and increase your visibility in
                the marketplace.
              </p>
              <TwitterVerificationButton
                serviceProviderId={serviceProviderId}
                onVerified={handleVerified}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Page>
  );
}
