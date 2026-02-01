import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Project id is required' });
  }

  if (req.method === 'POST') {
    try {
      const { voterWallet, voterLabel, voterFingerprint } = req.body as {
        voterWallet?: string;
        voterLabel?: string;
        voterFingerprint?: string;
      };

      const voterKey =
        (voterWallet as string)?.trim() || (voterFingerprint as string)?.trim() || null;
      if (!voterKey) {
        return res.status(400).json({
          error: 'Either voterWallet or voterFingerprint is required',
        });
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
    try {
      const { voterWallet, voterFingerprint } = req.body as {
        voterWallet?: string;
        voterFingerprint?: string;
      };
      const voterKey =
        (voterWallet as string)?.trim() || (voterFingerprint as string)?.trim() || null;
      if (!voterKey) {
        return res.status(400).json({
          error: 'Either voterWallet or voterFingerprint is required',
        });
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
