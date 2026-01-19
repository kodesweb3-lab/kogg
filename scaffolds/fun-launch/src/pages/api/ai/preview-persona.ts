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

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'microsoft/DialoGPT-medium';

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

    // Build context
    const history = conversationHistory
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`)
      .join('\n');
    const context = `${systemPrompt}\n\n${history}\nUser: ${message}\nBot:`;

    // Call HuggingFace API
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for preview

        const response = await fetch(`${HUGGINGFACE_API_URL}/${DEFAULT_MODEL}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: context,
            parameters: {
              max_length: 150,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
            },
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
          throw new Error(`API error: ${response.status}`);
        }

        const data = (await response.json()) as { generated_text?: string; error?: string } | Array<{ generated_text?: string }>;
        const result = Array.isArray(data) ? data[0] : data;

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.generated_text) {
          throw new Error('No response generated');
        }

        const generated = result.generated_text;
        const botIndex = generated.indexOf('Bot:');
        const responseText = botIndex !== -1
          ? generated.substring(botIndex + 'Bot:'.length).trim()
          : generated.trim();

        return res.status(200).json({ response: responseText });
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
