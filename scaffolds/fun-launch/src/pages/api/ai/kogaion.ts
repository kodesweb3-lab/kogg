import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

// Use HuggingFace's chat completions API with a model that supports it
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
// Mistral 7B is available via HuggingFace inference providers
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

type KogaionRequest = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemPrompt } = req.body as KogaionRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'HuggingFace API key not configured' });
    }

    // Build chat messages in OpenAI format
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    // Call HuggingFace Chat Completions API
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: chatMessages,
            max_tokens: 200,
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
          throw new Error('AI service is loading. Please try again later.');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // OpenAI-compatible response format
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
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Failed to generate response after retries');
  } catch (error) {
    logger.error('Error in Kogaion AI helper', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/ai/kogaion',
    });

    if (error instanceof Error) {
      return res.status(500).json({
        error: `Failed to get response: ${error.message}`,
      });
    }

    return res.status(500).json({
      error: 'Unknown error occurred',
    });
  }
}
