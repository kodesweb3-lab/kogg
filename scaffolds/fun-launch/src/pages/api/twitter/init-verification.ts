import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { BASE_URL } from '@/constants';
import { requireJsonContentType, invalidField } from '@/lib/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireJsonContentType(req.headers['content-type'], res)) return;

  try {
    const body = req.body;
    if (body === undefined || body === null) {
      return res.status(400).json({
        error: 'Request body must be valid JSON',
        code: 'VALIDATION_ERROR',
      });
    }
    const { serviceProviderId } = body as { serviceProviderId?: string };

    if (!serviceProviderId || typeof serviceProviderId !== 'string') {
      invalidField(res, 'Service provider ID is required', 'serviceProviderId', 'missing');
      return;
    }

    // Check if provider exists
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Check if already verified
    if (provider.verified) {
      return res.status(400).json({ error: 'Provider is already verified' });
    }

    // Generate unique verification code
    const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create or update verification record
    const verification = await prisma.twitterVerification.upsert({
      where: { serviceProviderId },
      create: {
        serviceProviderId,
        verificationCode,
        status: 'PENDING',
      },
      update: {
        verificationCode,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    // Generate Twitter OAuth URL
    // This will be implemented with Twitter OAuth library
    const websiteUrl = BASE_URL;
    const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/kogaionpack';
    const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/KogaionSol';

    const tweetMessage = `🚀 Just joined ${twitterUrl.replace('https://x.com/', '@')} as a service provider!

Kogaion, the next move into Solana launchpads is building 🐺

🌐 ${websiteUrl}
💬 ${telegramUrl}

Verification: ${verificationCode}`;

    res.status(200).json({
      success: true,
      verificationCode,
      tweetMessage,
      verificationId: verification.id,
    });
  } catch (error) {
    console.error('Error initializing Twitter verification:', error);
    res.status(500).json({
      error: 'Failed to initialize Twitter verification',
    });
  }
}
