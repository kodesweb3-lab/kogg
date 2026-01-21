import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { z } from 'zod';
import Header from '../components/Header';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Keypair, Transaction } from '@solana/web3.js';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('@/components/Confetti'), { ssr: false });

// Define the schema for form validation
const poolSchema = z.object({
  tokenName: z.string().min(3, 'Token name must be at least 3 characters'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokenLogo: z.instanceof(File, { message: 'Token logo is required' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  telegram: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  devBuyAmount: z.number().min(0).max(10).optional(),
});

interface FormValues {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: File | undefined;
  logoPreview?: string; // Base64 preview URL
  website?: string;
  twitter?: string;
  telegram?: string;
  devBuyAmount?: number;
}

export default function CreatePool() {
  const { publicKey, signTransaction } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm({
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenLogo: undefined,
      logoPreview: undefined,
      website: '',
      twitter: '',
      telegram: '',
      devBuyAmount: 0,
    } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        const { tokenLogo } = value;
        if (!tokenLogo) {
          toast.error('Token logo is required');
          return;
        }

        if (!signTransaction) {
          toast.error('Wallet not connected');
          return;
        }

        if (!address) {
          toast.error('Wallet address not available');
          return;
        }

        const keyPair = Keypair.generate();

        // Step 1: Upload image to Pinata
        toast.loading('Uploading image to IPFS...', { id: 'upload-image' });
        const formData = new FormData();
        formData.append('file', tokenLogo);

        const imageUploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!imageUploadResponse.ok) {
          const error = await imageUploadResponse.json();
          toast.error(error.error || 'Failed to upload image', { id: 'upload-image' });
          throw new Error(error.error || 'Failed to upload image');
        }

        const { imageUrl } = await imageUploadResponse.json();
        toast.success('Image uploaded successfully', { id: 'upload-image' });

        // Step 2: Upload metadata to Pinata
        toast.loading('Uploading metadata to IPFS...', { id: 'upload-metadata' });
        const metadataResponse = await fetch('/api/upload/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: value.tokenName,
            symbol: value.tokenSymbol,
            description: value.website || value.twitter || value.telegram 
              ? `Website: ${value.website || ''}, Twitter: ${value.twitter || ''}, Telegram: ${value.telegram || ''}` 
              : undefined,
            imageUrl: imageUrl,
          }),
        });

        if (!metadataResponse.ok) {
          const error = await metadataResponse.json();
          toast.error(error.error || 'Failed to upload metadata', { id: 'upload-metadata' });
          throw new Error(error.error || 'Failed to upload metadata');
        }

        const { metadataUri } = await metadataResponse.json();
        toast.success('Metadata uploaded successfully', { id: 'upload-metadata' });

        // Step 3: Create pool transaction
        toast.loading('Creating bonding curve pool...', { id: 'create-pool' });
        const poolTxResponse = await fetch('/api/create-pool-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mint: keyPair.publicKey.toBase58(),
            tokenName: value.tokenName,
            tokenSymbol: value.tokenSymbol,
            metadataUri: metadataUri,
            userWallet: address,
          }),
        });

        if (!poolTxResponse.ok) {
          const error = await poolTxResponse.json();
          toast.error(error.error || 'Failed to create pool transaction', { id: 'create-pool' });
          throw new Error(error.error || 'Failed to create pool transaction');
        }

        const { poolTx } = await poolTxResponse.json();
        const transaction = Transaction.from(Buffer.from(poolTx, 'base64'));

        // Step 4: Sign with keypair first
        transaction.sign(keyPair);

        // Step 5: Then sign with user's wallet
        toast.loading('Please sign the transaction in your wallet...', { id: 'sign-tx' });
        const signedTransaction = await signTransaction(transaction);
        toast.success('Transaction signed', { id: 'sign-tx' });

        // Step 6: Send signed transaction
        toast.loading('Sending transaction to Solana...', { id: 'send-tx' });
        const sendResponse = await fetch('/api/send-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction.serialize().toString('base64'),
          }),
        });

        if (!sendResponse.ok) {
          const error = await sendResponse.json();
          toast.error(error.error || 'Failed to send transaction', { id: 'send-tx' });
          throw new Error(error.error || 'Failed to send transaction');
        }

        const { success, signature } = await sendResponse.json();
        if (success) {
          // Step 7: Save token to database
          toast.loading('Saving token to database...', { id: 'save-token' });
          try {
            const saveTokenResponse = await fetch('/api/tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mint: keyPair.publicKey.toBase58(),
                name: value.tokenName,
                symbol: value.tokenSymbol,
                imageUrl: imageUrl,
                metadataUri: metadataUri,
                creatorWallet: address,
              }),
            });

            if (!saveTokenResponse.ok) {
              const error = await saveTokenResponse.json();
              console.error('Failed to save token to database:', error);
              toast.error('Token launched but failed to save to database', { id: 'save-token' });
            } else {
              toast.success('Token saved successfully', { id: 'save-token' });
              queryClient.invalidateQueries({ queryKey: ['explore', 'local-tokens'] });
            }
          } catch (dbError) {
            console.error('Error saving token to database:', dbError);
            toast.error('Token launched but failed to save to database', { id: 'save-token' });
          }

          // Step 8: Dev Buy (if amount > 0)
          const devBuyAmount = value.devBuyAmount || 0;
          if (devBuyAmount > 0) {
            toast.loading(`Buying ${devBuyAmount} SOL worth of tokens...`, { id: 'dev-buy' });
            try {
              // Get swap transaction
              const swapTxResponse = await fetch('/api/swap-transaction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  mint: keyPair.publicKey.toBase58(),
                  amountSol: devBuyAmount,
                  userWallet: address,
                  isBuy: true,
                }),
              });

              if (!swapTxResponse.ok) {
                const error = await swapTxResponse.json();
                toast.error(error.error || 'Failed to create swap transaction', { id: 'dev-buy' });
                // Don't throw - pool is already created
              } else {
                const { swapTx } = await swapTxResponse.json();
                const swapTransaction = Transaction.from(Buffer.from(swapTx, 'base64'));

                // Sign swap transaction
                toast.loading('Please sign the buy transaction...', { id: 'dev-buy' });
                const signedSwapTx = await signTransaction(swapTransaction);

                // Send swap transaction
                const swapSendResponse = await fetch('/api/send-transaction', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    signedTransaction: signedSwapTx.serialize().toString('base64'),
                  }),
                });

                if (!swapSendResponse.ok) {
                  const error = await swapSendResponse.json();
                  toast.error(error.error || 'Failed to send buy transaction', { id: 'dev-buy' });
                } else {
                  toast.success(`Successfully bought ${devBuyAmount} SOL worth of tokens! 🎉`, { id: 'dev-buy' });
                }
              }
            } catch (swapError) {
              console.error('Dev buy error:', swapError);
              toast.error('Dev buy failed, but your token was created successfully', { id: 'dev-buy' });
            }
          }

          const tokenMint = keyPair.publicKey.toBase58();
          const tweetText = `I just launched $${value.tokenSymbol} on @KogaionSol! The ritual is complete. Join the pack!`;
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`${window.location.origin}/token/${tokenMint}`)}`;
          
          toast.success(
            <div className="flex flex-col gap-2">
              <span>The ritual is complete! Token summoned successfully.</span>
              <div className="flex items-center gap-2">
                <a
                  href={`/token/${tokenMint}`}
                  className="text-xs text-mystic-steam-copper hover:underline"
                >
                  View Token
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
            { id: 'send-tx', duration: 10000 }
          );
          setShowConfetti(true);
          setPoolCreated(true);
        }
      } catch (error) {
        console.error('Error creating pool:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to summon token. The ritual must begin again.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = poolSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
        return undefined;
      },
    },
  });

  return (
    <>
      <Head>
        <title>Launch Token - Kogaion</title>
        <meta
          name="description"
          content="Launch your meme token on Kogaion. The most based launchpad on Solana. No cap."
        />
      </Head>

      <Confetti trigger={showConfetti} />

      <div className="min-h-screen bg-dacian-steel-dark text-mystic-steam-parchment relative">
        {/* Layered atmospheric background */}
        <div className="atmosphere-layer" />
        <div className="steam-layer" />
        <div className="castle-silhouette" />
        <div className="dacian-pattern" />
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 text-mystic-steam-copper ">
                Summon Your Token
              </h1>
              <p className="text-mystic-steam-parchment/70 font-body">Begin the ritual. Launch your token and start the ascent.</p>
            </div>
          </div>

          {poolCreated && !isLoading ? (
            <PoolCreationSuccess />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              {/* Token Details Section */}
              <div className="steel-panel rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-mystic-steam-copper">Token Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="tokenName"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Token Name*
                      </label>
                      {form.Field({
                        name: 'tokenName',
                        children: (field) => (
                          <input
                            id="tokenName"
                            name={field.name}
                            type="text"
                            className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                            placeholder="e.g. Virtual Coin"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            minLength={3}
                          />
                        ),
                      })}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="tokenSymbol"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Token Symbol*
                      </label>
                      {form.Field({
                        name: 'tokenSymbol',
                        children: (field) => (
                          <input
                            id="tokenSymbol"
                            name={field.name}
                            type="text"
                            className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                            placeholder="e.g. VRTL"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            maxLength={10}
                          />
                        ),
                      })}
                    </div>
                  </div>

                  <div>
                      <label
                        htmlFor="tokenLogo"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Token Logo*
                      </label>
                    {form.Field({
                      name: 'tokenLogo',
                      children: (field) => {
                        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.handleChange(file);
                            // Create preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              form.setFieldValue('logoPreview', reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        
                        return (
                          <div>
                            <div className="border-2 border-dashed border-mystic-steam-copper/30 rounded-lg p-8 text-center">
                              {form.state.values.logoPreview || field.state.value ? (
                                <div className="space-y-4">
                                  <img
                                    src={form.state.values.logoPreview || (field.state.value ? URL.createObjectURL(field.state.value) : '')}
                                    alt="Logo preview"
                                    className="mx-auto max-h-32 max-w-32 rounded-lg object-contain border border-mystic-steam-copper/20"
                                  />
                                  <div>
                                    <p className="text-gray-400 text-xs mb-2">
                                      {field.state.value?.name || 'Preview'}
                                    </p>
                                    <label
                                      htmlFor="tokenLogo"
                                      className="bg-dacian-steel-gunmetal px-4 py-2 rounded-lg text-sm hover:bg-dacian-steel-steel transition cursor-pointer text-mystic-steam-parchment/70 font-body inline-block"
                                    >
                                      Change Image
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="iconify w-6 h-6 mx-auto mb-2 text-gray-400 ph--upload-bold" />
                                  <p className="text-gray-400 text-xs mb-2">PNG, JPG or SVG (max. 10MB)</p>
                                  <label
                                    htmlFor="tokenLogo"
                                    className="bg-dacian-steel-gunmetal px-4 py-2 rounded-lg text-sm hover:bg-dacian-steel-steel transition cursor-pointer text-mystic-steam-parchment/70 font-body inline-block"
                                  >
                                    Choose File
                                  </label>
                                </>
                              )}
                              <input
                                type="file"
                                id="tokenLogo"
                                className="hidden"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/gif,image/webp"
                                onChange={handleFileChange}
                              />
                            </div>
                          </div>
                        );
                      },
                    })}
                  </div>
                </div>
              </div>

              {/* Dev Buy Section */}
              <div className="steel-panel rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-mystic-steam-copper">Initial Buy (Optional)</h2>
                <p className="text-gray-400 text-sm mb-4 font-body">
                  Buy tokens immediately after launch. Be the first holder of your own token.
                </p>

                <div className="max-w-xs">
                  <label
                    htmlFor="devBuyAmount"
                    className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                  >
                    Amount (SOL)
                  </label>
                  {form.Field({
                    name: 'devBuyAmount',
                    children: (field) => (
                      <div>
                        <input
                          id="devBuyAmount"
                          name={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                          placeholder="0.1"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-gray-500 mt-1 font-body">
                          Leave at 0 to skip initial buy. Max 10 SOL.
                        </p>
                      </div>
                    ),
                  })}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="steel-panel rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold mb-6 text-mystic-steam-copper">Social Links (Optional)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="mb-4">
                    <label
                      htmlFor="website"
                      className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                    >
                      Website
                    </label>
                    {form.Field({
                      name: 'website',
                      children: (field) => (
                        <input
                          id="website"
                          name={field.name}
                          type="url"
                          className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                          placeholder="https://yourwebsite.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                    >
                      Twitter
                    </label>
                    {form.Field({
                      name: 'twitter',
                      children: (field) => (
                        <input
                          id="twitter"
                          name={field.name}
                          type="url"
                          className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                          placeholder="https://twitter.com/yourusername"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="telegram"
                      className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                    >
                      Telegram
                    </label>
                    {form.Field({
                      name: 'telegram',
                      children: (field) => (
                        <input
                          id="telegram"
                          name={field.name}
                          type="url"
                          className="w-full p-3 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                          placeholder="https://t.me/yourchannel"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>
                </div>
              </div>

              {form.state.errors && form.state.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 space-y-2">
                  {form.state.errors.map((error, index) =>
                    Object.entries(error || {}).map(([, value]) => (
                      <div key={index} className="flex items-start gap-2">
                        <p className="text-red-200">
                          {Array.isArray(value)
                            ? value.map((v: any) => v.message || v).join(', ')
                            : typeof value === 'string'
                              ? value
                              : String(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <SubmitButton isSubmitting={isLoading} />
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  if (!publicKey) {
    return (
      <Button type="button" onClick={() => setShowModal(true)}>
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <Button className="flex items-center gap-2" type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <span className="iconify ph--spinner w-5 h-5 animate-spin" />
          <span>Launching Token...</span>
        </>
      ) : (
        <>
          <span className="iconify ph--rocket-bold w-5 h-5" />
          <span>Summon Token</span>
        </>
      )}
    </Button>
  );
};

const PoolCreationSuccess = () => {
  return (
    <>
      <div className="steel-panel rounded-xl p-8 text-center">
        <div className="bg-green-500/20 p-4 rounded-full inline-flex mb-6">
          <span className="iconify ph--check-bold w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-heading font-bold mb-4 text-mystic-steam-copper ">The Ritual is Complete! 🎉</h2>
        <p className="text-mystic-steam-parchment/70 mb-8 max-w-lg mx-auto font-body">
          Your token has been summoned. The pack awaits. Begin the ascent.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-dacian-steel-gunmetal px-6 py-3 rounded-xl font-body font-medium hover:bg-dacian-steel-steel transition text-mystic-steam-parchment/70"
          >
            Discover Tokens
          </Link>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="cursor-pointer bg-gradient-to-r from-mystic-steam-copper to-mystic-steam-copper/80 px-6 py-3 rounded-xl font-body font-medium hover:shadow-[0_0_20px_rgba(85,234,212,0.5)] transition text-black"
          >
            Launch Another Token
          </button>
        </div>
      </div>
    </>
  );
};
