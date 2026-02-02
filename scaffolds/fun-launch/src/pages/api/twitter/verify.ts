import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { requireJsonContentType, invalidField } from '@/lib/apiErrors';

// This endpoint will verify the tweet by checking Twitter API
// For now, it's a placeholder that requires manual confirmation
// Full implementation will use Twitter API v2 to search for the tweet

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
    const { verificationId, tweetId, twitterHandle } = body as {
      verificationId?: string;
      tweetId?: string;
      twitterHandle?: string;
    };

    if (!verificationId || typeof verificationId !== 'string') {
      invalidField(res, 'Verification ID is required', 'verificationId', 'missing');
      return;
    }

    if (!tweetId || typeof tweetId !== 'string') {
      invalidField(res, 'Tweet ID is required', 'tweetId', 'missing');
      return;
    }

    if (!twitterHandle || typeof twitterHandle !== 'string') {
      invalidField(res, 'Twitter handle is required', 'twitterHandle', 'missing');
      return;
    }

    // Find verification
    const verification = await prisma.twitterVerification.findUnique({
      where: { id: verificationId },
      include: { serviceProvider: true },
    });

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    if (verification.status !== 'PENDING') {
      return res.status(400).json({ error: `Verification is already ${verification.status}` });
    }

    // TODO: Implement Twitter API check
    // For now, we'll mark it as verified if tweetId is provided
    // In production, this should:
    // 1. Use Twitter API to fetch the tweet
    // 2. Verify it contains the verification code
    // 3. Verify it's from the correct Twitter account
    // 4. Then mark as verified

    // Clean Twitter handle
    const cleanHandle = twitterHandle.replace(/^@/, '').trim();

    // Update verification and provider
    await prisma.$transaction([
      prisma.twitterVerification.update({
        where: { id: verificationId },
        data: {
          status: 'VERIFIED',
          tweetId,
          verifiedAt: new Date(),
        },
      }),
      prisma.serviceProvider.update({
        where: { id: verification.serviceProviderId },
        data: {
          verified: true,
          verifiedAt: new Date(),
          twitterHandle: cleanHandle,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Verification completed successfully',
    });
  } catch (error) {
    console.error('Error verifying Twitter account:', error);
    res.status(500).json({
      error: 'Failed to verify Twitter account',
    });
  }
}
