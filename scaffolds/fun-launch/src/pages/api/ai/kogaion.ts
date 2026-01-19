import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

// Use Together AI for Apriel model (also available on HuggingFace)
// Apriel-1.6-15B-Thinker is a reasoning model with excellent performance
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = 'ServiceNow-AI/Apriel-1.6-15b-Thinker';

type KogaionRequest = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
};

// Extract final response from Apriel's reasoning format
function extractFinalResponse(text: string): string {
  // Apriel uses [BEGIN FINAL RESPONSE] marker before the actual response
  const finalResponseMatch = text.match(/\[BEGIN FINAL RESPONSE\]([\s\S]*?)(?:<\|end\|>|$)/);
  if (finalResponseMatch) {
    return finalResponseMatch[1].trim();
  }
  // If no marker found, return the whole text (cleaned)
  return text.replace(/Here are my reasoning steps:[\s\S]*?(?=\[BEGIN|$)/i, '').trim() || text.trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemPrompt } = req.body as KogaionRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check for API keys - prefer Together AI, fallback to HuggingFace
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!togetherApiKey && !huggingfaceApiKey) {
      // Fallback response when no API key is configured
      const fallbackResponses = [
        "Welcome to Kogaion! I'm the platform guide. To launch a token, connect your wallet and click 'Launch Token'. You'll need to provide a name, symbol, and logo for your token.",
        "The Dynamic Bonding Curve (DBC) is how tokens are priced during the bonding phase. As more people buy, the price goes up. Once the curve reaches 100%, your token graduates to DAMM v2.",
        "To get started, connect your Solana wallet using the button in the top right. Then visit the 'Launch' page to create your first token.",
        "Each token on Kogaion can have its own AI personality for Telegram. After launching, activate your token's bot to engage with your community automatically.",
        "The 'Pack' refers to the community of holders. As your pack grows, so does the strength of your token. Welcome to the mountain!",
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.status(200).json({ response: randomResponse });
    }

    // Determine which API to use
    const useTogetherAI = !!togetherApiKey;
    const apiUrl = useTogetherAI ? TOGETHER_API_URL : HUGGINGFACE_API_URL;
    const apiKey = togetherApiKey || huggingfaceApiKey;

    // Build enhanced system prompt for Apriel
    const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT: Keep your responses concise and helpful. When you finish reasoning, provide your final response after [BEGIN FINAL RESPONSE].`;

    // Build chat messages
    const chatMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    // Call API
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // Longer timeout for reasoning model

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: chatMessages,
            max_tokens: 512, // More tokens for reasoning + response
            temperature: 0.6, // Recommended by Apriel docs
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
        const rawResponse = data.choices?.[0]?.message?.content;

        if (!rawResponse) {
          throw new Error('No response generated');
        }

        // Extract final response from Apriel's reasoning format
        const finalResponse = extractFinalResponse(rawResponse);

        return res.status(200).json({ response: finalResponse });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.name === 'AbortError') {
          throw new Error('Request timed out. The AI is thinking hard! Please try again.');
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
