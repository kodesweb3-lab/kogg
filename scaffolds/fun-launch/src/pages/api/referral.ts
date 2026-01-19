import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get referral stats for a wallet
    const { wallet } = req.query;

    if (typeof wallet !== 'string') {
      return res.status(400).json({ error: 'wallet is required' });
    }

    try {
      const referrals = await prisma.referral.count({
        where: { referrerWallet: wallet },
      });

      return res.status(200).json({
        success: true,
        referralCount: referrals,
        referralLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kogg-production.up.railway.app'}/?ref=${wallet}`,
      });
    } catch (error) {
      logger.error('Get referral stats error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to get referral stats' });
    }
  }

  if (req.method === 'POST') {
    // Track a referral
    const { referrerWallet, referredWallet } = req.body;

    if (!referrerWallet || !referredWallet) {
      return res.status(400).json({ error: 'referrerWallet and referredWallet are required' });
    }

    if (referrerWallet === referredWallet) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    try {
      // Check if referral already exists
      const existing = await prisma.referral.findUnique({
        where: {
          referrerWallet_referredWallet: {
            referrerWallet,
            referredWallet,
          },
        },
      });

      if (existing) {
        return res.status(200).json({ success: true, alreadyReferred: true });
      }

      // Create referral
      await prisma.referral.create({
        data: {
          referrerWallet,
          referredWallet,
        },
      });

      return res.status(201).json({ success: true });
    } catch (error) {
      logger.error('Track referral error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to track referral' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
