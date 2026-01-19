import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'microsoft/DialoGPT-medium';

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

    // Build context from system prompt and conversation history
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
    const context = `${systemPrompt}\n\nConversation:\n${messages
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'User' : 'Kogaion'}: ${m.content}`)
      .join('\n')}\n\nKogaion:`;

    // Call HuggingFace API with timeout and retry
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${HUGGINGFACE_API_URL}/${DEFAULT_MODEL}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: context,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          const estimatedTime = (errorData.estimated_time || 20) * 1000;
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, Math.min(estimatedTime, 30000)));
            continue;
          }
          throw new Error('HuggingFace model is loading. Please try again later.');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
        }

        const data = (await response.json()) as { generated_text?: string; error?: string } | Array<{ generated_text?: string }>;

        const result = Array.isArray(data) ? data[0] : data;

        if (result.error) {
          throw new Error(`HuggingFace API error: ${result.error}`);
        }

        if (!result.generated_text) {
          throw new Error('No generated text in HuggingFace response');
        }

        // Extract assistant response
        const generated = result.generated_text;
        const kogaionIndex = generated.indexOf('Kogaion:');
        const responseText = kogaionIndex !== -1
          ? generated.substring(kogaionIndex + 'Kogaion:'.length).trim()
          : generated.trim();

        return res.status(200).json({ response: responseText });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.name === 'AbortError' || (error instanceof Error && error.message.includes('4'))) {
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
