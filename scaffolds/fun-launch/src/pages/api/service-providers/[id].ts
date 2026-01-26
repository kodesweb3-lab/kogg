import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Provider ID is required' });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        tags: true,
        twitterVerification: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error('Error fetching service provider:', error);
    res.status(500).json({
      error: 'Failed to fetch service provider',
    });
  }
}
