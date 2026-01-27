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
  // Aggregated statistics
  statistics: {
    totalTokens: number;
    totalVolume: number;
    totalMarketCap: number;
    averagePrice: number;
    totalHolders: number;
    tokensByType: {
      MEMECOIN: number;
      RWA: number;
    };
    tokensCreatedByMonth: Array<{
      month: string;
      count: number;
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

    // Fetch metrics for all tokens created by this wallet
    const tokenMints = tokensCreated.map((t) => t.mint);
    const metrics = await prisma.metric.findMany({
      where: {
        tokenMint: {
          in: tokenMints,
        },
      },
    });

    // Calculate aggregated statistics
    const totalVolume = metrics.reduce((sum, m) => sum + (m.vol24h || 0), 0);
    const totalMarketCap = metrics.reduce((sum, m) => sum + (m.mcap || 0), 0);
    const totalHolders = metrics.reduce((sum, m) => sum + (m.holders || 0), 0);
    const prices = metrics.filter((m) => m.price && m.price > 0).map((m) => m.price!);
    const averagePrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;

    // Count tokens by type
    const tokensByType = {
      MEMECOIN: tokensCreated.filter((t) => t.tokenType === 'MEMECOIN').length,
      RWA: tokensCreated.filter((t) => t.tokenType === 'RWA').length,
    };

    // Group tokens by month for chart data
    const tokensByMonthMap = new Map<string, number>();
    tokensCreated.forEach((token) => {
      const date = new Date(token.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      tokensByMonthMap.set(monthKey, (tokensByMonthMap.get(monthKey) || 0) + 1);
    });
    const tokensCreatedByMonth = Array.from(tokensByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

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
            email: serviceProvider.email,
            telegram: serviceProvider.telegram,
            twitterHandle: serviceProvider.twitterHandle,
          }
        : null,
      tokensCreated,
      referralStats: {
        totalReferred: referrals.length,
        referrals,
      },
      statistics: {
        totalTokens: tokensCreated.length,
        totalVolume,
        totalMarketCap,
        averagePrice,
        totalHolders,
        tokensByType,
        tokensCreatedByMonth,
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
