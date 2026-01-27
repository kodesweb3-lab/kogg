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
  tokenType: 'MEMECOIN' | 'RWA';
  assetType?: string;
  assetDescription?: string;
  assetValue?: number;
  assetLocation?: string;
  documents?: File[];
  uploadedDocuments?: Array<{ url: string; name: string; type: string }>;
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
      tokenType: 'MEMECOIN' as const,
      assetType: undefined,
      assetDescription: undefined,
      assetValue: undefined,
      assetLocation: undefined,
      documents: undefined,
      uploadedDocuments: undefined,
    } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        const { tokenLogo } = value;
        if (!tokenLogo) {
          toast.error('The ritual requires a token sigil.');
          setIsLoading(false);
          return;
        }

        // Validate RWA fields if tokenType is RWA
        if (value.tokenType === 'RWA') {
          if (!value.assetType || !value.assetType.trim()) {
              toast.error('The ritual requires an asset type.');
            setIsLoading(false);
            return;
          }
          if (!value.assetDescription || !value.assetDescription.trim()) {
              toast.error('The ritual requires an asset description.');
            setIsLoading(false);
            return;
          }
        }

        if (!signTransaction) {
          toast.error('The chain requires your wallet.');
          setIsLoading(false);
          return;
        }

        if (!address) {
          toast.error('The seal cannot be found.');
          setIsLoading(false);
          return;
        }

        const keyPair = Keypair.generate();

        // Step 1: Upload image to Pinata
        toast.loading('The chain listens...', { id: 'upload-image' });
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
        toast.success('The seal holds.', { id: 'upload-image' });

        // Step 1.5: Upload documents if RWA token
        let uploadedDocuments: Array<{ url: string; name: string; type: string }> | undefined;
        if (value.tokenType === 'RWA' && value.documents && value.documents.length > 0) {
          toast.loading('Uploading documents to IPFS...', { id: 'upload-documents' });
          try {
            const documentsFormData = new FormData();
            value.documents.forEach((file) => {
              documentsFormData.append('documents', file);
            });

            const documentsResponse = await fetch('/api/upload/documents', {
              method: 'POST',
              body: documentsFormData,
            });

            if (!documentsResponse.ok) {
              const error = await documentsResponse.json();
              toast.error(error.error || 'Failed to upload documents', { id: 'upload-documents' });
              throw new Error(error.error || 'Failed to upload documents');
            }

            const { documents: docs } = await documentsResponse.json();
            uploadedDocuments = docs.map((doc: any) => ({
              url: doc.url,
              name: doc.name,
              type: doc.type,
            }));
            toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`, { id: 'upload-documents' });
          } catch (docError) {
            console.error('Document upload error:', docError);
            toast.error('Document upload failed, but continuing with token creation', { id: 'upload-documents' });
          }
        }

        // Step 2: Upload metadata to Pinata
        toast.loading('Uploading metadata to IPFS...', { id: 'upload-metadata' });
        const metadataPayload: any = {
          name: value.tokenName,
          symbol: value.tokenSymbol,
          description: value.website || value.twitter || value.telegram 
            ? `Website: ${value.website || ''}, Twitter: ${value.twitter || ''}, Telegram: ${value.telegram || ''}` 
            : undefined,
          imageUrl: imageUrl,
          tokenType: value.tokenType,
        };

        // Add RWA fields if tokenType is RWA
        if (value.tokenType === 'RWA') {
          if (value.assetType) metadataPayload.assetType = value.assetType;
          if (value.assetDescription) metadataPayload.assetDescription = value.assetDescription;
          if (value.assetValue !== undefined && value.assetValue !== null) metadataPayload.assetValue = value.assetValue;
          if (value.assetLocation) metadataPayload.assetLocation = value.assetLocation;
          if (uploadedDocuments && uploadedDocuments.length > 0) metadataPayload.documents = uploadedDocuments;
        }

        const metadataResponse = await fetch('/api/upload/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadataPayload),
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
            const tokenPayload: any = {
              mint: keyPair.publicKey.toBase58(),
              name: value.tokenName,
              symbol: value.tokenSymbol,
              imageUrl: imageUrl,
              metadataUri: metadataUri,
              creatorWallet: address,
              tokenType: value.tokenType,
            };

            // Add RWA fields if tokenType is RWA
            if (value.tokenType === 'RWA') {
              if (value.assetType) tokenPayload.assetType = value.assetType;
              if (value.assetDescription) tokenPayload.assetDescription = value.assetDescription;
              if (value.assetValue !== undefined && value.assetValue !== null) tokenPayload.assetValue = value.assetValue;
              if (value.assetLocation) tokenPayload.assetLocation = value.assetLocation;
              if (uploadedDocuments && uploadedDocuments.length > 0) {
                tokenPayload.documents = uploadedDocuments;
              }
            }

            const saveTokenResponse = await fetch('/api/tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tokenPayload),
            });

            if (!saveTokenResponse.ok) {
              const error = await saveTokenResponse.json();
              console.error('Failed to save token to database:', error);
              toast.error('The ritual succeeded, but the seal was not recorded.', { id: 'save-token' });
            } else {
              toast.success('The seal holds. Your token is bound to the chain.', { id: 'save-token' });
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
                  toast.success(`The pact is sealed. ${devBuyAmount} SOL bound to your token.`, { id: 'dev-buy' });
                }
              }
            } catch (swapError) {
              console.error('Dev buy error:', swapError);
              toast.error('The ritual failed. Gas was not enough. Your token remains.', { id: 'dev-buy' });
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
              {/* Token Type Selector */}
              <div className="steel-panel rounded-xl p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-mystic-steam-copper">Token Type</h2>
                <p className="text-mystic-steam-parchment/70 mb-4 font-body text-sm">
                  Choose between a memecoin or tokenize a real-world asset (product, service, or asset)
                </p>
                {form.Field({
                  name: 'tokenType',
                  children: (field) => (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        onClick={() => field.handleChange('MEMECOIN')}
                        className={`flex-1 min-h-[60px] sm:min-h-[80px] p-4 md:p-6 rounded-lg border-2 transition-all font-body ${
                          field.state.value === 'MEMECOIN'
                            ? 'border-dacian-steel-copper bg-dacian-steel-copper/20 text-mystic-steam-copper'
                            : 'border-dacian-steel-steel/30 bg-dacian-steel-gunmetal text-mystic-steam-parchment/70 hover:border-dacian-steel-steel/50'
                        }`}
                      >
                        <div className="font-bold mb-1 text-base md:text-lg">Memecoin</div>
                        <div className="text-xs md:text-sm">Traditional meme token</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.handleChange('RWA')}
                        className={`flex-1 min-h-[60px] sm:min-h-[80px] p-4 md:p-6 rounded-lg border-2 transition-all font-body ${
                          field.state.value === 'RWA'
                            ? 'border-dacian-steel-copper bg-dacian-steel-copper/20 text-mystic-steam-copper'
                            : 'border-dacian-steel-steel/30 bg-dacian-steel-gunmetal text-mystic-steam-parchment/70 hover:border-dacian-steel-steel/50'
                        }`}
                      >
                        <div className="font-bold mb-1 text-base md:text-lg">Real World Asset (RWA)</div>
                        <div className="text-xs md:text-sm">Tokenize products, services, or assets</div>
                      </button>
                    </div>
                  ),
                })}
              </div>

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
                            className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
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
                            className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
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
                          className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
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
                          className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
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
                          className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
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
                          className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                          placeholder="https://t.me/yourchannel"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>
                </div>
              </div>

              {/* RWA Fields Section - Only show when tokenType is RWA */}
              {form.state.values.tokenType === 'RWA' && (
                <div className="steel-panel rounded-xl p-8">
                  <h2 className="text-2xl font-heading font-bold mb-4 text-mystic-steam-copper">Asset Information</h2>
                  <p className="text-mystic-steam-parchment/70 mb-6 font-body text-sm">
                    Provide details about the real-world asset you're tokenizing
                  </p>

                  <div className="space-y-6">
                    {/* Asset Type */}
                    <div>
                      <label
                        htmlFor="assetType"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Asset Type*
                      </label>
                      {form.Field({
                        name: 'assetType',
                        children: (field) => (
                          <select
                            id="assetType"
                            name={field.name}
                            className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                            value={field.state.value || ''}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          >
                            <option value="">Select asset type...</option>
                            <option value="physical_product">Physical Product</option>
                            <option value="service">Service</option>
                            <option value="real_estate">Real Estate</option>
                            <option value="financial_asset">Financial Asset</option>
                            <option value="intellectual_property">Intellectual Property</option>
                            <option value="other">Other</option>
                          </select>
                        ),
                      })}
                    </div>

                    {/* Asset Description */}
                    <div>
                      <label
                        htmlFor="assetDescription"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Asset Description*
                      </label>
                      {form.Field({
                        name: 'assetDescription',
                        children: (field) => (
                          <textarea
                            id="assetDescription"
                            name={field.name}
                            rows={4}
                            className="w-full min-h-[120px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                            placeholder="Describe your asset in detail..."
                            value={field.state.value || ''}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                        ),
                      })}
                    </div>

                    {/* Asset Value and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="assetValue"
                          className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                        >
                          Estimated Value (USD)
                        </label>
                        {form.Field({
                          name: 'assetValue',
                          children: (field) => (
                            <input
                              id="assetValue"
                              name={field.name}
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                              placeholder="0.00"
                              value={field.state.value || ''}
                              onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          ),
                        })}
                      </div>

                      <div>
                        <label
                          htmlFor="assetLocation"
                          className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                        >
                          Location (Optional)
                        </label>
                        {form.Field({
                          name: 'assetLocation',
                          children: (field) => (
                            <input
                              id="assetLocation"
                              name={field.name}
                              type="text"
                              className="w-full min-h-[44px] p-3 md:p-4 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment font-body text-base focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                              placeholder="e.g., New York, USA"
                              value={field.state.value || ''}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          ),
                        })}
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div>
                      <label
                        htmlFor="documents"
                        className="block text-sm font-body font-medium text-mystic-steam-parchment/70 mb-1"
                      >
                        Supporting Documents (Optional)
                      </label>
                      <p className="text-xs text-mystic-steam-parchment/50 mb-2 font-body">
                        Upload certificates, invoices, photos, or other documents (PDF, images, documents). Max 10 files, 20MB each.
                      </p>
                      {form.Field({
                        name: 'documents',
                        children: (field) => {
                          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const fileArray = Array.from(files);
                              field.handleChange(fileArray);
                            }
                          };

                          return (
                            <div>
                              <div className="border-2 border-dashed border-dacian-steel-steel/30 rounded-lg p-6 text-center">
                                {field.state.value && field.state.value.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="text-sm text-mystic-steam-parchment/70 mb-2">
                                      {field.state.value.length} file(s) selected
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {field.state.value.map((file, index) => (
                                        <div key={index} className="text-xs text-mystic-steam-parchment/60 text-left">
                                          • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                      ))}
                                    </div>
                                    <label
                                      htmlFor="documents"
                                      className="bg-dacian-steel-gunmetal px-4 py-2 rounded-lg text-sm hover:bg-dacian-steel-steel transition cursor-pointer text-mystic-steam-parchment/70 font-body inline-block mt-2"
                                    >
                                      Change Files
                                    </label>
                                  </div>
                                ) : (
                                  <>
                                    <span className="iconify w-6 h-6 mx-auto mb-2 text-gray-400 ph--file-bold" />
                                    <p className="text-gray-400 text-xs mb-2">PDF, images, or documents</p>
                                    <label
                                      htmlFor="documents"
                                      className="bg-dacian-steel-gunmetal px-4 py-2 rounded-lg text-sm hover:bg-dacian-steel-steel transition cursor-pointer text-mystic-steam-parchment/70 font-body inline-block"
                                    >
                                      Choose Files
                                    </label>
                                  </>
                                )}
                                <input
                                  type="file"
                                  id="documents"
                                  className="hidden"
                                  multiple
                                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.txt,.xls,.xlsx"
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
              )}

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
