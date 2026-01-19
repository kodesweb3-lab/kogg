import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

// Duplicate buildSystemPrompt here (can't import from worker in Next.js API route)
function buildSystemPrompt(
  systemPrompt: string,
  traits: string[],
  tone: string,
  allowed?: string[],
  forbidden?: string[]
): string {
  let prompt = systemPrompt;
  if (traits.length > 0) {
    prompt += `\n\nTraits: ${traits.join(', ')}`;
  }
  prompt += `\nTone: ${tone}`;
  if (allowed && allowed.length > 0) {
    prompt += `\nAllowed topics: ${allowed.join(', ')}`;
  }
  if (forbidden && forbidden.length > 0) {
    prompt += `\nForbidden topics: ${forbidden.join(', ')}`;
  }
  prompt += '\n\nYou are a Telegram bot representing this token. Use the personality defined above. Respond naturally and engagingly.';
  return prompt;
}

// Use HuggingFace's chat completions API
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

type PreviewRequest = {
  message: string;
  persona: {
    systemPrompt: string;
    traits: string[];
    tone: string;
    allowed?: string[];
    forbidden?: string[];
  };
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, persona, conversationHistory } = req.body as PreviewRequest;

    if (!message || !persona) {
      return res.status(400).json({ error: 'Message and persona are required' });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HuggingFace API key not configured' });
    }

    // Build system prompt from persona (user-owned)
    const systemPrompt = buildSystemPrompt(
      persona.systemPrompt,
      persona.traits,
      persona.tone,
      persona.allowed,
      persona.forbidden
    );

    // Build chat messages in OpenAI format
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call HuggingFace Chat Completions API
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: chatMessages,
            max_tokens: 150,
            temperature: 0.7,
            top_p: 0.9,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 503) {
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
          }
          throw new Error('Model is loading. Please try again.');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;

        if (!responseText) {
          throw new Error('No response generated');
        }

        return res.status(200).json({ response: responseText.trim() });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.name === 'AbortError') {
          throw lastError;
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Failed to generate preview');
  } catch (error) {
    logger.error('Error in persona preview', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/ai/preview-persona',
    });

    if (error instanceof Error) {
      return res.status(500).json({
        error: `Preview failed: ${error.message}`,
      });
    }

    return res.status(500).json({
      error: 'Unknown error occurred',
    });
  }
}
