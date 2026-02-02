import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireJsonContentType, validationError } from '@/lib/apiErrors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) {
    validationError(res, 'Project id is required', [{ field: 'id', reason: 'missing' }]);
    return;
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
      const { voterWallet, voterLabel, voterFingerprint } = body as {
        voterWallet?: string;
        voterLabel?: string;
        voterFingerprint?: string;
      };

      const voterKey =
        (voterWallet as string)?.trim() || (voterFingerprint as string)?.trim() || null;
      if (!voterKey) {
        validationError(res, 'Either voterWallet or voterFingerprint is required', [
          { field: 'voterWallet', reason: 'missing' },
          { field: 'voterFingerprint', reason: 'missing' },
        ]);
        return;
      }

      const project = await prisma.agentProject.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const existing = await prisma.projectVote.findUnique({
        where: { projectId_voterKey: { projectId: id, voterKey } },
      });
      if (existing) {
        return res.status(409).json({ error: 'Already voted for this project' });
      }

      await prisma.$transaction([
        prisma.projectVote.create({
          data: {
            projectId: id,
            voterKey,
            voterWallet: (voterWallet as string)?.trim() || null,
            voterLabel: (voterLabel as string)?.trim() || null,
          },
        }),
        prisma.agentProject.update({
          where: { id },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.agentProject.findUnique({
        where: { id },
        select: { voteCount: true },
      });

      return res.status(201).json({
        success: true,
        voteCount: updated?.voteCount ?? project.voteCount + 1,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Vote POST error', err);
      if (err.message?.includes('Unique constraint') || (err as { code?: string }).code === 'P2002') {
        return res.status(409).json({ error: 'Already voted for this project' });
      }
      return res.status(500).json({ error: 'Failed to add vote' });
    }
  }

  if (req.method === 'DELETE') {
    if (!requireJsonContentType(req.headers['content-type'], res)) return;
    try {
      const body = req.body;
      if (body === undefined || body === null) {
        return res.status(400).json({
          error: 'Request body must be valid JSON',
          code: 'VALIDATION_ERROR',
        });
      }
      const { voterWallet, voterFingerprint } = body as {
        voterWallet?: string;
        voterFingerprint?: string;
      };
      const voterKey =
        (voterWallet as string)?.trim() || (voterFingerprint as string)?.trim() || null;
      if (!voterKey) {
        validationError(res, 'Either voterWallet or voterFingerprint is required', [
          { field: 'voterWallet', reason: 'missing' },
          { field: 'voterFingerprint', reason: 'missing' },
        ]);
        return;
      }

      const vote = await prisma.projectVote.findUnique({
        where: { projectId_voterKey: { projectId: id, voterKey } },
      });
      if (!vote) {
        return res.status(404).json({ error: 'Vote not found' });
      }

      await prisma.$transaction([
        prisma.projectVote.delete({ where: { id: vote.id } }),
        prisma.agentProject.update({
          where: { id },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      const updated = await prisma.agentProject.findUnique({
        where: { id },
        select: { voteCount: true },
      });

      return res.status(200).json({
        success: true,
        voteCount: Math.max(0, updated?.voteCount ?? 0),
      });
    } catch (error) {
      logger.error('Vote DELETE error', error instanceof Error ? error : new Error(String(error)));
      return res.status(500).json({ error: 'Failed to remove vote' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
