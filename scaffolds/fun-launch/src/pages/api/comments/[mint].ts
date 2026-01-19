import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mint } = req.query;

  if (typeof mint !== 'string') {
    return res.status(400).json({ error: 'Invalid mint address' });
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
    try {
      const { wallet, content } = req.body;

      if (!wallet || !content) {
        return res.status(400).json({ error: 'wallet and content are required' });
      }

      if (content.length > 500) {
        return res.status(400).json({ error: 'Comment too long (max 500 characters)' });
      }

      // Basic rate limiting check - 1 comment per 30 seconds per wallet per token
      const recentComment = await prisma.comment.findFirst({
        where: {
          tokenMint: mint,
          wallet,
          createdAt: {
            gte: new Date(Date.now() - 30000), // 30 seconds ago
          },
        },
      });

      if (recentComment) {
        return res.status(429).json({ error: 'Please wait 30 seconds before posting again' });
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
