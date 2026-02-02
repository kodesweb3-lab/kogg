import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireJsonContentType, validationError } from '@/lib/apiErrors';

type CreateProjectBody = {
  title: string;
  description?: string;
  html?: string;
  css?: string;
  js?: string;
  python?: string;
  authorWallet?: string;
  authorLabel?: string;
  language?: string;
  thumbnail?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        authorWallet,
        authorLabel,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const validSort = ['createdAt', 'voteCount', 'updatedAt'];
      const sortField = validSort.includes(sortBy as string) ? sortBy : 'createdAt';
      const order = sortOrder === 'asc' ? 'asc' : 'desc';

      const where: { authorWallet?: string; authorLabel?: string } = {};
      if (authorWallet && typeof authorWallet === 'string') where.authorWallet = authorWallet;
      if (authorLabel && typeof authorLabel === 'string') where.authorLabel = authorLabel;

      const [projects, total] = await Promise.all([
        prisma.agentProject.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { [sortField]: order },
          select: {
            id: true,
            title: true,
            description: true,
            authorWallet: true,
            authorLabel: true,
            voteCount: true,
            createdAt: true,
            updatedAt: true,
            thumbnail: true,
            language: true,
          },
        }),
        prisma.agentProject.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Projects GET error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  if (req.method === 'POST') {
    if (!requireJsonContentType(req.headers['content-type'], res)) return;
    try {
      const body = req.body;
      if (body === undefined || body === null) {
        return res.status(400).json({
          error: 'Request body must be valid JSON',
          code: 'VALIDATION_ERROR',
        });
      }
      const {
        title,
        description,
        html,
        css,
        js,
        python,
        authorWallet,
        authorLabel,
        language,
        thumbnail,
      } = body as CreateProjectBody;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        validationError(res, 'title is required', [{ field: 'title', reason: 'missing' }]);
        return;
      }

      const hasContent =
        [html, css, js, python].some(
          (v) => typeof v === 'string' && v.trim().length > 0
        );
      if (!hasContent) {
        validationError(res, 'At least one of html, css, js, or python must have content', [
          { field: 'html', reason: 'missing' },
          { field: 'css', reason: 'missing' },
          { field: 'js', reason: 'missing' },
          { field: 'python', reason: 'missing' },
        ]);
        return;
      }

      const project = await prisma.agentProject.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          html: html?.trim() || null,
          css: css?.trim() || null,
          js: js?.trim() || null,
          python: python?.trim() || null,
          authorWallet: authorWallet?.trim() || null,
          authorLabel: authorLabel?.trim() || null,
          language: language?.trim() || null,
          thumbnail: thumbnail?.trim() || null,
        },
      });

      return res.status(201).json({ success: true, project });
    } catch (error) {
      logger.error('Projects POST error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
