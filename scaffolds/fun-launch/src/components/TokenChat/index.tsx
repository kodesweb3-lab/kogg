import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@jup-ag/wallet-adapter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/Skeleton';

type Comment = {
  id: string;
  tokenMint: string;
  wallet: string;
  content: string;
  createdAt: string;
};

interface TokenChatProps {
  tokenMint: string;
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function TokenChat({ tokenMint }: TokenChatProps) {
  const { publicKey, connected } = useWallet();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch comments
  const { data, isLoading, refetch } = useQuery<{ comments: Comment[] }>({
    queryKey: ['comments', tokenMint],
    queryFn: async () => {
      const res = await fetch(`/api/comments/${tokenMint}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const comments = data?.comments || [];

  // Post comment mutation
  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/comments/${tokenMint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey?.toBase58(),
          content,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to post comment');
      }
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['comments', tokenMint] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to post');
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim() || !publicKey) return;
      postMutation.mutate(message.trim());
    },
    [message, publicKey, postMutation]
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  return (
    <div className="bg-mystic-steam-ash rounded-xl border border-mystic-steam-copper/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-mystic-steam-copper/20">
        <h3 className="font-heading font-bold text-mystic-steam-copper">Pack Chat</h3>
        <span className="text-xs text-mystic-steam-parchment/50 font-body">{comments.length} messages</span>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-mystic-steam-parchment/50 font-body text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {[...comments].reverse().map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="flex items-start gap-2">
                  <a
                    href={`https://solscan.io/account/${comment.wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-mystic-steam-copper hover:underline shrink-0"
                  >
                    {truncateWallet(comment.wallet)}
                  </a>
                  <span className="text-xs text-mystic-steam-parchment/50">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-mystic-steam-parchment/80 font-body mt-0.5 break-words">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-mystic-steam-copper/20 p-3">
        {connected ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something..."
              maxLength={500}
              className="flex-1 px-3 py-2 bg-mystic-steam-charcoal border border-mystic-steam-copper/10 rounded-lg text-mystic-steam-parchment placeholder-mystic-steam-parchment/40 focus:outline-none focus:ring-2 focus:ring-mystic-steam-copper/30 font-body text-sm"
              disabled={postMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || postMutation.isPending}
              className="px-4"
            >
              {postMutation.isPending ? '...' : 'Send'}
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500 font-body text-sm">
            Connect wallet to chat
          </p>
        )}
      </form>
    </div>
  );
}

export default TokenChat;
