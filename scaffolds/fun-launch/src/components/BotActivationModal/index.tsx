'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@jup-ag/wallet-adapter';
import { TokenPersonalityBuilder, PersonaData } from '@/components/TokenPersonalityBuilder';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';

interface BotActivationModalProps {
  tokenMint: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BotActivationModal({ tokenMint, isOpen, onClose, onSuccess }: BotActivationModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const [step, setStep] = useState<'personality' | 'botToken' | 'payment'>('personality');
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [botToken, setBotToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePersonaSave = (data: PersonaData) => {
    setPersonaData(data);
    setStep('botToken');
    toast.success('Personality saved! Now add your BotFather token.');
  };

  const handleActivate = async () => {
    if (!personaData || !botToken.trim() || !publicKey || !signTransaction) {
      toast.error('Please complete all fields and connect your wallet');
      return;
    }

    setIsLoading(true);

    try {
      // Call activate endpoint
      const response = await fetch('/api/bot/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint,
          botToken,
          systemPrompt: personaData.systemPrompt,
          traitsJson: JSON.stringify(personaData.traits),
          allowed: personaData.allowed ? JSON.stringify(personaData.allowed) : undefined,
          forbidden: personaData.forbidden ? JSON.stringify(personaData.forbidden) : undefined,
          tone: personaData.tone,
          personaStyleJson: JSON.stringify(personaData.style),
          brandingJson: JSON.stringify(personaData.branding),
          presetUsed: personaData.presetUsed,
          userWallet: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create activation transaction');
      }

      const { transaction: serializedTx, treasuryWallet, amount } = await response.json();

      // Sign transaction
      const tx = Transaction.from(Buffer.from(serializedTx, 'base64'));
      const signedTx = await signTransaction(tx);
      
      // Get signature from signed transaction
      // Note: We need to send the transaction and get the signature from the network
      const signedTxBase64 = signedTx.serialize().toString('base64');

      // Send transaction
      const sendResponse = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedTransaction: signedTxBase64 }),
      });

      if (!sendResponse.ok) {
        const error = await sendResponse.json();
        throw new Error(error.error || 'Failed to send transaction');
      }

      const { signature: txSignature } = await sendResponse.json();

      // Confirm bot activation
      const confirmResponse = await fetch('/api/bot/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenMint, signature: txSignature }),
      });

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || 'Failed to confirm bot activation');
      }

      toast.success('Bot activated successfully! It will be live within 30 seconds.');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to activate bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-steam-cyber-bgElevated border-2 border-steam-cyber-neon-cyan/40 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-steam-cyber-neon-cyan">
                    Activate Token Bot
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {step === 'personality' && (
                  <div>
                    <TokenPersonalityBuilder
                      tokenMint={tokenMint}
                      onSave={handlePersonaSave}
                    />
                  </div>
                )}

                {step === 'botToken' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-body font-medium mb-2 text-gray-300">
                        BotFather Token
                      </label>
                      <input
                        type="password"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="Enter your BotFather token"
                        className="w-full p-3 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/20 rounded-lg text-gray-100 font-body focus:outline-none focus:ring-2 focus:ring-steam-cyber-neon-cyan"
                      />
                      <p className="text-xs text-gray-500 mt-1 font-body">
                        Get this from @BotFather on Telegram. It will be encrypted and stored securely.
                      </p>
                    </div>
                    <div className="bg-steam-cyber-bgHover p-4 rounded-lg border border-steam-cyber-neon-cyan/20">
                      <p className="text-sm text-gray-300 font-body mb-2">
                        <strong className="text-steam-cyber-neon-cyan">Activation Fee:</strong> 0.1 SOL
                      </p>
                      <p className="text-xs text-gray-500 font-body">
                        Payment goes to treasury wallet. Bot activates after on-chain confirmation.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep('personality')}>
                        Back
                      </Button>
                      <Button
                        onClick={handleActivate}
                        disabled={!botToken.trim() || isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Activating...' : 'Activate Bot (0.1 SOL)'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
