import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireJsonContentType, validationError, invalidField } from '@/lib/apiErrors';

const COMMENTS_RATE_LIMIT_SECONDS = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mint } = req.query;

  if (typeof mint !== 'string') {
    invalidField(res, 'Invalid mint address', 'mint', 'invalid');
    return;
  }

  if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: { tokenMint: mint },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.status(200).json({ success: true, comments });
    } catch (error) {
      logger.error('Get comments error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  if (req.method === 'POST') {
    if (!requireJsonContentType(req.headers['content-type'], res)) return;
    try {
      const body = req.body;
      if (body === undefined || body === null) {
        return res.status(400).json({
          error: 'Request body must be valid JSON',
          code: 'VALIDATION_ERROR',
        });
      }
      const { wallet, content } = body as { wallet?: string; content?: string };

      if (!wallet || !content) {
        const details: { field: string; reason: 'missing' }[] = [];
        if (!wallet) details.push({ field: 'wallet', reason: 'missing' });
        if (!content) details.push({ field: 'content', reason: 'missing' });
        validationError(res, 'wallet and content are required', details);
        return;
      }

      if (content.length > 500) {
        invalidField(res, 'Comment too long (max 500 characters)', 'content', 'too_long');
        return;
      }

      // Basic rate limiting check - 1 comment per 30 seconds per wallet per token
      const recentComment = await prisma.comment.findFirst({
        where: {
          tokenMint: mint,
          wallet,
          createdAt: {
            gte: new Date(Date.now() - COMMENTS_RATE_LIMIT_SECONDS * 1000),
          },
        },
      });

      if (recentComment) {
        res.setHeader('Retry-After', String(COMMENTS_RATE_LIMIT_SECONDS));
        return res.status(429).json({
          error: 'Please wait 30 seconds before posting again',
          retryAfterSeconds: COMMENTS_RATE_LIMIT_SECONDS,
        });
      }

      const comment = await prisma.comment.create({
        data: {
          tokenMint: mint,
          wallet,
          content: content.trim(),
        },
      });

      return res.status(201).json({ success: true, comment });
    } catch (error) {
      logger.error('Post comment error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
