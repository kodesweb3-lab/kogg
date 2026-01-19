import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mint } = req.query;

    if (!mint || typeof mint !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid mint parameter',
      });
    }

    const token = await prisma.token.findUnique({
      where: {
        mint: mint,
      },
      include: {
        metrics: true,
      },
    });

    if (!token) {
      return res.status(404).json({
        error: 'Token not found',
      });
    }

    res.status(200).json({
      success: true,
      data: token,
    });
  } catch (error) {
    logger.error('Error fetching token', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/tokens/[mint]',
      mint: typeof req.query.mint === 'string' ? req.query.mint : undefined,
    });
    return res.status(500).json({
      error: 'Failed to fetch token',
    });
  }
}
