import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

type DashboardData = {
  wallet: string;
  isServiceProvider: boolean;
  serviceProvider?: {
    id: string;
    verified: boolean;
    verifiedAt: Date | null;
    tags: string[];
    description: string | null;
  } | null;
  tokensCreated: {
    id: string;
    mint: string;
    name: string;
    symbol: string;
    tokenType: 'MEMECOIN' | 'RWA';
    createdAt: Date;
  }[];
  referralStats: {
    totalReferred: number;
    referrals: Array<{
      referredWallet: string;
      createdAt: Date;
    }>;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate wallet format (basic Solana address check)
    if (wallet.length < 32 || wallet.length > 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Fetch service provider data
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { wallet },
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    // Fetch tokens created by this wallet
    const tokensCreated = await prisma.token.findMany({
      where: { creatorWallet: wallet },
      select: {
        id: true,
        mint: true,
        name: true,
        symbol: true,
        tokenType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 tokens
    });

    // Fetch referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerWallet: wallet },
      select: {
        referredWallet: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const dashboardData: DashboardData = {
      wallet,
      isServiceProvider: !!serviceProvider,
      serviceProvider: serviceProvider
        ? {
            id: serviceProvider.id,
            verified: serviceProvider.verified,
            verifiedAt: serviceProvider.verifiedAt,
            tags: serviceProvider.tags.map((t) => t.tag),
            description: serviceProvider.description,
          }
        : null,
      tokensCreated,
      referralStats: {
        totalReferred: referrals.length,
        referrals,
      },
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    logger.error('Dashboard API error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/dashboard',
    });

    return res.status(500).json({
      error: 'Failed to fetch dashboard data',
    });
  }
}
