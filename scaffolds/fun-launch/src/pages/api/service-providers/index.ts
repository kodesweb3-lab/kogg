import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      verified,
      tag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (verified === 'true') {
      where.verified = true;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            contains: tag as string,
            mode: 'insensitive',
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { twitterHandle: { contains: search as string, mode: 'insensitive' } },
        { telegram: { contains: search as string, mode: 'insensitive' } },
        { tags: { some: { tag: { contains: search as string, mode: 'insensitive' } } } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'verified') {
      orderBy.verified = sortOrder;
      orderBy.createdAt = 'desc'; // Secondary sort
    } else {
      orderBy[sortBy as string] = sortOrder;
    }

    // Get providers
    const [providers, total] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      providers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({
      error: 'Failed to fetch service providers',
    });
  }
}
