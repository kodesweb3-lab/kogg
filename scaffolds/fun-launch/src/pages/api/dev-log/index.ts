import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '20',
        category,
        status,
        publicOnly = 'true',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Validate pagination
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        });
      }

      // Build where clause
      const where: any = {
        isPublic: publicOnly === 'true',
      };

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      // Get dev logs with pagination
      const [devLogs, total] = await Promise.all([
        prisma.devLog.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: {
            publishedAt: 'desc',
          },
        }),
        prisma.devLog.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: devLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Error fetching dev logs', error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/dev-log',
        method: 'GET',
      });
      return res.status(500).json({
        error: 'Failed to fetch dev logs',
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, category, status, version } = req.body;

      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({
          error: 'Missing required fields: title and content are required',
        });
      }

      // Validate category
      const validCategories = ['UPDATE', 'FIX', 'ANNOUNCEMENT', 'ROADMAP', 'TECHNICAL'];
      if (category && !validCategories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }

      // Validate status
      const validStatuses = ['COMPLETED', 'IN_PROGRESS', 'PLANNED', 'BLOCKED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Create dev log entry
      const devLog = await prisma.devLog.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          category: category || 'UPDATE',
          status: status || 'COMPLETED',
          version: version?.trim() || null,
          isPublic: true,
        },
      });

      res.status(201).json({
        success: true,
        devLog,
      });
    } catch (error) {
      logger.error('Error creating dev log', error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/dev-log',
        method: 'POST',
      });
      return res.status(500).json({
        error: 'Failed to create dev log',
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
