// Using native fetch in Node.js 18+

// Use HuggingFace's chat completions API
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

/**
 * Generate AI response using HuggingFace Chat Completions API
 */
export async function generateResponse(
  prompt: string,
  context: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY environment variable is required');
  }

  // Build chat messages in OpenAI format
  const messages = [
    { role: 'system', content: context },
    { role: 'user', content: prompt },
  ];

  const maxRetries = 3;
  const timeoutMs = 30000;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await globalThis.fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
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

      const data = (await response.json()) as ChatCompletionResponse;

      if (data.error) {
        throw new Error(`AI API error: ${data.error}`);
      }

      const responseText = data.choices?.[0]?.message?.content;

      if (!responseText) {
        throw new Error('No response generated');
      }

      return responseText.trim();
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
}

/**
 * Build system prompt from persona configuration
 * This uses the USER'S system prompt (user-owned), not Kogaion platform voice
 */
export function buildSystemPrompt(
  systemPrompt: string, // User-owned final system prompt
  traits: string[],
  tone: string,
  allowed?: string[],
  forbidden?: string[]
): string {
  // Start with user's final system prompt (they own it)
  let prompt = systemPrompt;

  // Add traits if provided
  if (traits.length > 0) {
    prompt += `\n\nTraits: ${traits.join(', ')}`;
  }

  // Add tone
  prompt += `\nTone: ${tone}`;

  // Add allowed topics
  if (allowed && allowed.length > 0) {
    prompt += `\nAllowed topics: ${allowed.join(', ')}`;
  }

  // Add forbidden topics
  if (forbidden && forbidden.length > 0) {
    prompt += `\nForbidden topics: ${forbidden.join(', ')}`;
  }

  // Final instruction (user's bot, not Kogaion)
  prompt += '\n\nYou are a Telegram bot representing this token. Use the personality defined above. Respond naturally and engagingly.';

  return prompt;
}
