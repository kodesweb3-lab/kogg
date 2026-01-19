// Using native fetch in Node.js 18+

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'microsoft/DialoGPT-medium';

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

/**
 * Generate AI response using HuggingFace API
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

  const fullPrompt = `${context}\n\nUser: ${prompt}\nAssistant:`;

  const maxRetries = 3;
  const timeoutMs = 30000; // 30 seconds
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await globalThis.fetch(`${HUGGINGFACE_API_URL}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
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

      // Handle 503 (model loading) - retry after delay
      if (response.status === 503) {
        const errorData = await response.json().catch(() => ({}));
        const estimatedTime = (errorData.estimated_time || 20) * 1000; // Convert to ms
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

      const data = (await response.json()) as HuggingFaceResponse | HuggingFaceResponse[];

      // Handle array response (some models return arrays)
      const result = Array.isArray(data) ? data[0] : data;

      if (result.error) {
        throw new Error(`HuggingFace API error: ${result.error}`);
      }

      if (!result.generated_text) {
        throw new Error('No generated text in HuggingFace response');
      }

      // Extract just the assistant's response
      const generated = result.generated_text;
      const assistantIndex = generated.indexOf('Assistant:');
      if (assistantIndex !== -1) {
        return generated.substring(assistantIndex + 'Assistant:'.length).trim();
      }

      return generated.trim();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on abort (timeout) or client errors (4xx)
      if (lastError.name === 'AbortError' || (error instanceof Error && error.message.includes('4'))) {
        throw lastError;
      }

      // Retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
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
