import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

type LeaderboardEntry = {
  rank: number;
  wallet: string;
  tokensCreated: number;
  latestToken?: {
    symbol: string;
    name: string;
    mint: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get top creators by number of tokens created
    const creatorStats = await prisma.token.groupBy({
      by: ['creatorWallet'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 20,
    });

    // Get latest token for each creator
    const leaderboard: LeaderboardEntry[] = await Promise.all(
      creatorStats.map(async (stat, index) => {
        const latestToken = await prisma.token.findFirst({
          where: { creatorWallet: stat.creatorWallet },
          orderBy: { createdAt: 'desc' },
          select: { symbol: true, name: true, mint: true },
        });

        return {
          rank: index + 1,
          wallet: stat.creatorWallet,
          tokensCreated: stat._count.id,
          latestToken: latestToken || undefined,
        };
      })
    );

    // Get total stats
    const totalTokens = await prisma.token.count();
    const uniqueCreators = await prisma.token.groupBy({
      by: ['creatorWallet'],
    });

    res.status(200).json({
      success: true,
      leaderboard,
      stats: {
        totalTokens,
        totalCreators: uniqueCreators.length,
      },
    });
  } catch (error) {
    logger.error('Leaderboard error', error instanceof Error ? error : new Error(String(error)));
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
