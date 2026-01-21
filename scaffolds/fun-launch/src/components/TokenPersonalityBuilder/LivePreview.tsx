'use client';

import { useState } from 'react';
import { PersonaData } from './index';
import { Button } from '@/components/ui/button';

interface LivePreviewProps {
  personaData: PersonaData;
}

export function LivePreview({ personaData }: LivePreviewProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([
    { role: 'bot', content: 'Hello! I\'m your token bot. Ask me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call preview endpoint (uses HuggingFace with persona)
      const response = await fetch('/api/ai/preview-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          persona: personaData,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get preview');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Sorry, preview unavailable. Check your HuggingFace API key.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mystic-steam-charcoal rounded-lg border border-mystic-steam-copper/20 p-4">
      <h3 className="text-lg font-heading font-semibold mb-4 text-mystic-steam-copper">
        Live Preview
      </h3>
      <div className="space-y-2 mb-4 h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg text-sm font-body ${
                msg.role === 'user'
                  ? 'bg-mystic-steam-copper/20 text-gray-100'
                  : 'bg-dacian-steel-gunmetal text-mystic-steam-parchment'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dacian-steel-gunmetal p-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-mystic-steam-copper rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-mystic-steam-copper rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-mystic-steam-copper rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
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
          placeholder="Type a message to preview..."
          className="flex-1 p-2 bg-mystic-steam-charcoal border border-mystic-steam-copper/20 rounded-lg text-gray-100 text-sm font-body focus:outline-none focus:ring-2 focus:ring-mystic-steam-copper"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="text-sm px-4 py-2">
          Send
        </Button>
      </form>
      <p className="text-xs text-gray-500 mt-2 font-body">
        Preview uses HuggingFace API. No Telegram needed.
      </p>
    </div>
  );
}
