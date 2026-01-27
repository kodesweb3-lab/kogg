'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TagSelector } from './TagSelector';

interface ServiceProviderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProvider: {
    id: string;
    email: string | null;
    telegram: string | null;
    twitterHandle: string | null;
    description: string | null;
    tags: string[];
  };
  onSuccess: () => void;
}

export function ServiceProviderEditModal({
  isOpen,
  onClose,
  serviceProvider,
  onSuccess,
}: ServiceProviderEditModalProps) {
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState(serviceProvider.email || '');
  const [telegram, setTelegram] = useState(serviceProvider.telegram || '');
  const [twitterHandle, setTwitterHandle] = useState(serviceProvider.twitterHandle || '');
  const [description, setDescription] = useState(serviceProvider.description || '');
  const [tags, setTags] = useState<string[]>(serviceProvider.tags || []);

  // Reset form when service provider data changes
  useEffect(() => {
    if (isOpen && serviceProvider) {
      setEmail(serviceProvider.email || '');
      setTelegram(serviceProvider.telegram || '');
      setTwitterHandle(serviceProvider.twitterHandle || '');
      setDescription(serviceProvider.description || '');
      setTags(serviceProvider.tags || []);
    }
  }, [isOpen, serviceProvider]);

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
      const response = await fetch('/api/service-providers/update', {
        method: 'PUT',
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
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-xl p-6 md:p-8 rim-light max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-aureate-base">
                  Edit Service Provider Profile
                </h2>
                <button
                  onClick={onClose}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-body font-medium text-[var(--text-primary)] mb-2">
                      Email <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-aureate-base/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-[var(--text-primary)] mb-2">
                      Telegram <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username or username"
                      className="w-full px-4 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-aureate-base/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-[var(--text-primary)] mb-2">
                      Twitter Handle <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@username or username"
                      className="w-full px-4 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-aureate-base/50"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Note: Changing your Twitter handle may require re-verification
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-[var(--text-primary)] mb-2">
                      Description <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your services and expertise..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 bg-obsidian-surface border border-obsidian-border rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-aureate-base/50 resize-none"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {description.length} / 500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-body font-medium text-[var(--text-primary)] mb-2">
                      Services & Tags <span className="text-[var(--text-muted)]">(required)</span>
                    </label>
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      Select tags that describe your services. You can choose from predefined tags or create custom ones.
                    </p>
                    <TagSelector selectedTags={tags} onTagsChange={setTags} maxTags={10} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || tags.length === 0}
                    className="bg-aureate-base/80 hover:bg-aureate-base text-obsidian-base"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
