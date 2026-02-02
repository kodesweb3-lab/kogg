import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireJsonContentType, invalidField } from '@/lib/apiErrors';

type PatchBody = {
  title?: string;
  description?: string;
  html?: string;
  css?: string;
  js?: string;
  python?: string;
  language?: string;
  thumbnail?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) {
    invalidField(res, 'Project id is required', 'id', 'missing');
    return;
  }

  if (req.method === 'GET') {
    try {
      const { voterWallet, voterFingerprint } = req.query;
      const voterKey =
        (voterWallet as string)?.trim() || (voterFingerprint as string)?.trim() || null;

      const project = await prisma.agentProject.findUnique({
        where: { id },
        include: voterKey
          ? { votes: { where: { voterKey }, select: { id: true } } }
          : {},
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const votesList = 'votes' in project ? (project as { votes: { id: string }[] }).votes : [];
      const voted = !!voterKey && Array.isArray(votesList) && votesList.length > 0;

      const { votes: _votes, ...rest } = project as typeof project & { votes?: unknown[] };
      return res.status(200).json({
        success: true,
        project: {
          ...rest,
          voted: !!voted,
        },
      });
    } catch (error) {
      logger.error('Project GET error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  if (req.method === 'PATCH') {
    if (!requireJsonContentType(req.headers['content-type'], res)) return;
    try {
      const project = await prisma.agentProject.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const body = req.body as PatchBody & { authorWallet?: string; authorLabel?: string };
      if (body === undefined || body === null) {
        return res.status(400).json({
          error: 'Request body must be valid JSON',
          code: 'VALIDATION_ERROR',
        });
      }
      const {
        authorWallet,
        authorLabel,
        title,
        description,
        html,
        css,
        js,
        python,
        language,
        thumbnail,
      } = body;

      const claimWallet = (authorWallet as string)?.trim();
      const claimLabel = (authorLabel as string)?.trim();

      const isAuthor =
        (claimWallet && project.authorWallet === claimWallet) ||
        (claimLabel && project.authorLabel === claimLabel);

      if (!isAuthor) {
        return res.status(403).json({ error: 'Only the author can update this project' });
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = typeof title === 'string' ? title.trim() : title;
      if (description !== undefined) updateData.description = description?.trim() ?? null;
      if (html !== undefined) updateData.html = html?.trim() ?? null;
      if (css !== undefined) updateData.css = css?.trim() ?? null;
      if (js !== undefined) updateData.js = js?.trim() ?? null;
      if (python !== undefined) updateData.python = python?.trim() ?? null;
      if (language !== undefined) updateData.language = language?.trim() ?? null;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail?.trim() ?? null;

      const updated = await prisma.agentProject.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({ success: true, project: updated });
    } catch (error) {
      logger.error('Project PATCH error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
