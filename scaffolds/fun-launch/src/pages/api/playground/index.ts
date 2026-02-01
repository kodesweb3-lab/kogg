import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const MAX_CONTENT_LENGTH = 2000;
const RATE_LIMIT_MS = 15000; // 1 message per 15 seconds per wallet or per IP (anonymous)

// In-memory fallback for anonymous rate limit by IP (best-effort in serverless)
const anonymousLastPost = new Map<string, number>();
const ANON_CLEANUP_INTERVAL = 60_000;
let lastAnonCleanup = Date.now();
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded?.[0] ?? req.socket?.remoteAddress ?? 'unknown';
  return String(ip).trim() || 'unknown';
}
function checkAnonymousRateLimit(ip: string): boolean {
  const now = Date.now();
  if (now - lastAnonCleanup > ANON_CLEANUP_INTERVAL) {
    lastAnonCleanup = now;
    for (const [key, ts] of anonymousLastPost) {
      if (now - ts > RATE_LIMIT_MS) anonymousLastPost.delete(key);
    }
  }
  const last = anonymousLastPost.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return false;
  anonymousLastPost.set(ip, now);
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { limit = '50', cursor } = req.query;
      const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);

      const messages = await prisma.playgroundMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limitNum + 1,
        ...(cursor && typeof cursor === 'string'
          ? { cursor: { id: cursor }, skip: 1 }
          : {}),
      });

      const hasMore = messages.length > limitNum;
      const list = hasMore ? messages.slice(0, limitNum) : messages;
      const nextCursor = hasMore ? list[list.length - 1]?.id : null;

      return res.status(200).json({
        success: true,
        messages: list.reverse(), // oldest first for chat display
        nextCursor: nextCursor ?? undefined,
      });
    } catch (error) {
      logger.error('Playground GET error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { wallet, authorLabel, content } = req.body as {
        wallet?: string;
        authorLabel?: string;
        content?: string;
      };

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content is required' });
      }

      const trimmed = content.trim();
      if (trimmed.length === 0) {
        return res.status(400).json({ error: 'content cannot be empty' });
      }
      if (trimmed.length > MAX_CONTENT_LENGTH) {
        return res.status(400).json({
          error: `content too long (max ${MAX_CONTENT_LENGTH} characters)`,
        });
      }

      // Rate limit: by wallet if provided, else by IP (anonymous)
      if (wallet && typeof wallet === 'string') {
        const recent = await prisma.playgroundMessage.findFirst({
          where: {
            wallet,
            createdAt: { gte: new Date(Date.now() - RATE_LIMIT_MS) },
          },
        });
        if (recent) {
          return res.status(429).json({
            error: 'Please wait 15 seconds before posting again',
          });
        }
      } else {
        const ip = getClientIp(req);
        if (!checkAnonymousRateLimit(ip)) {
          return res.status(429).json({
            error: 'Please wait 15 seconds before posting again',
          });
        }
      }

      const message = await prisma.playgroundMessage.create({
        data: {
          wallet: wallet?.trim() || null,
          authorLabel: authorLabel?.trim() || null,
          content: trimmed,
        },
      });

      return res.status(201).json({ success: true, message });
    } catch (error) {
      logger.error('Playground POST error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to post message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
