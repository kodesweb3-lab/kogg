'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const KOGAION_SYSTEM_PROMPT = `You are Kogaion, the Dacian Wolf spirit and platform guide for a Solana token launchpad.

Your role:
- Help users understand how to launch tokens
- Explain the Dynamic Bonding Curve (DBC) system
- Guide users through the token launch process
- Answer questions about Kogaion's features (personality builder, bot activation, etc.)
- Provide information about Solana, Meteora, and token mechanics

IMPORTANT RULES:
- You are the PLATFORM helper, NOT a token bot
- Never act as if you represent a specific token
- Never leak secrets (API keys, encryption keys, etc.)
- Never provide financial advice
- Keep responses helpful, mythic but readable
- Reference the "mountain" (curve), "ascent" (progress), "pack" (holders), "graduation" (DAMM v2)

You are helpful, knowledgeable, and maintain the ritualistic tone of Kogaion.`;

export function AskKogaion() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings. I am Kogaion, guardian of the mountain. How may I guide your ascent?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/kogaion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: KOGAION_SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-ritual-amber-400 to-ritual-amber-600 rounded-full shadow-lg hover:shadow-ritual-amber/50 flex items-center gap-2 px-3 py-2 text-ritual-bg font-heading font-bold z-50 focus:outline-none focus:ring-2 focus:ring-ritual-amber-500"
        aria-label="Chat with Kogaion"
      >
        <img 
          src="/brand/kogaion-icon.svg" 
          alt="Kogaion" 
          className="w-5 h-5"
        />
        <span className="text-xs hidden sm:inline">Chat with me</span>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-sm md:max-w-md h-auto max-h-[80vh] sm:h-[450px] md:h-[500px] bg-ritual-bgElevated border-2 border-ritual-amber-500/40 rounded-lg shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-ritual-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/brand/kogaion-icon.svg" alt="Kogaion" className="w-8 h-8" />
                  <div>
                    <h3 className="font-heading font-bold text-ritual-amber-400">Ask Kogaion</h3>
                    <p className="text-xs text-gray-400 font-body">Platform Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-ritual-amber-500/20 text-gray-100'
                          : 'bg-ritual-bgHover text-gray-300 border border-ritual-amber-500/20'
                      } font-body`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-ritual-bgHover p-3 rounded-lg border border-ritual-amber-500/20">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-ritual-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-ritual-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-ritual-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-ritual-amber-500/20">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about launching tokens..."
                    className="flex-1 p-3 bg-ritual-bgHover border border-ritual-amber-500/20 rounded-lg text-gray-100 font-body focus:outline-none focus:ring-2 focus:ring-ritual-amber-500"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
