import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { verificationId, serviceProviderId } = req.query;

    if (!verificationId && !serviceProviderId) {
      return res.status(400).json({ error: 'Verification ID or Service Provider ID is required' });
    }

    const verification = await prisma.twitterVerification.findUnique({
      where: {
        id: verificationId as string,
        ...(serviceProviderId ? { serviceProviderId: serviceProviderId as string } : {}),
      },
      include: {
        serviceProvider: true,
      },
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Check if verification is expired (24 hours)
    const expiresAt = new Date(verification.createdAt);
    expiresAt.setHours(expiresAt.getHours() + 24);
    const isExpired = new Date() > expiresAt;

    if (isExpired && verification.status === 'PENDING') {
      await prisma.twitterVerification.update({
        where: { id: verification.id },
        data: { status: 'EXPIRED' },
      });
      verification.status = 'EXPIRED';
    }

    res.status(200).json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.status,
        verificationCode: verification.verificationCode,
        createdAt: verification.createdAt,
        verifiedAt: verification.verifiedAt,
      },
      provider: {
        id: verification.serviceProvider.id,
        verified: verification.serviceProvider.verified,
        twitterHandle: verification.serviceProvider.twitterHandle,
      },
    });
  } catch (error) {
    console.error('Error checking Twitter verification:', error);
    res.status(500).json({
      error: 'Failed to check Twitter verification',
    });
  }
}
