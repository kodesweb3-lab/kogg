import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { validateWalletAddress } from '@/lib/validation/wallet';
import { isPredefinedTag } from '@/lib/service-provider-tags';
import { requireJsonContentType, validationError, invalidField } from '@/lib/apiErrors';

type UpdateRequest = {
  wallet: string;
  email?: string;
  telegram?: string;
  twitterHandle?: string;
  description?: string;
  tags?: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
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
    const { wallet, email, telegram, twitterHandle, description, tags } = body as UpdateRequest;

    // Validate wallet
    if (!wallet || typeof wallet !== 'string') {
      invalidField(res, 'Wallet address is required', 'wallet', 'missing');
      return;
    }

    const walletValidation = validateWalletAddress(wallet);
    if (!walletValidation.valid) {
      invalidField(res, walletValidation.error ?? 'Invalid wallet', 'wallet', 'invalid');
      return;
    }

    // Check if service provider exists
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { wallet },
      include: { tags: true },
    });

    if (!existingProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Validate tags if provided
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length === 0) {
        validationError(res, 'At least one tag is required', [{ field: 'tags', reason: 'missing' }]);
        return;
      }

      // Validate tag format (max 50 chars, no special chars except spaces and hyphens)
      const tagRegex = /^[a-zA-Z0-9\s-]{1,50}$/;
      for (const tag of tags) {
        if (typeof tag !== 'string' || !tag.trim()) {
          validationError(res, 'Invalid tag format', [{ field: 'tags', reason: 'invalid' }]);
          return;
        }
        if (!tagRegex.test(tag.trim())) {
          validationError(res, `Invalid tag format: ${tag}`, [{ field: 'tags', reason: 'invalid' }]);
          return;
        }
      }
    }

    // Validate description length if provided
    if (description !== undefined && description !== null) {
      if (typeof description === 'string' && description.length > 500) {
        validationError(res, 'Description must be 500 characters or less', [
          { field: 'description', reason: 'too_long' },
        ]);
        return;
      }
    }

    // Clean Twitter handle (remove @ if present)
    const cleanTwitterHandle = twitterHandle !== undefined
      ? (twitterHandle?.replace(/^@/, '').trim() || null)
      : existingProvider.twitterHandle;

    // Update service provider
    const updateData: any = {
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(telegram !== undefined && { telegram: telegram?.trim() || null }),
      ...(twitterHandle !== undefined && { twitterHandle: cleanTwitterHandle }),
      ...(description !== undefined && { description: description?.trim() || null }),
    };

    // Handle tags update if provided
    if (tags !== undefined) {
      // Delete existing tags
      await prisma.serviceProviderTag.deleteMany({
        where: { serviceProviderId: existingProvider.id },
      });

      // Create new tags
      updateData.tags = {
        create: tags.map((tag) => ({
          tag: tag.trim(),
          isCustom: !isPredefinedTag(tag.trim()),
        })),
      };
    }

    const updatedProvider = await prisma.serviceProvider.update({
      where: { wallet },
      data: updateData,
      include: {
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      serviceProvider: {
        id: updatedProvider.id,
        wallet: updatedProvider.wallet,
        email: updatedProvider.email,
        telegram: updatedProvider.telegram,
        twitterHandle: updatedProvider.twitterHandle,
        description: updatedProvider.description,
        verified: updatedProvider.verified,
        verifiedAt: updatedProvider.verifiedAt,
        tags: updatedProvider.tags.map((t) => t.tag),
      },
    });
  } catch (error) {
    logger.error('Service provider update error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/service-providers/update',
    });

    return res.status(500).json({
      error: 'Failed to update service provider',
    });
  }
}
