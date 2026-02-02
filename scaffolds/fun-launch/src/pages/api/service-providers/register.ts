import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { validateWalletAddress } from '@/lib/validation/wallet';
import { isPredefinedTag } from '@/lib/service-provider-tags';
import { requireJsonContentType, validationError, invalidField } from '@/lib/apiErrors';

interface RegisterRequest {
  wallet: string;
  email?: string;
  telegram?: string;
  twitterHandle?: string;
  description?: string;
  tags: string[]; // Array of tag names (predefined or custom)
}

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
    const { wallet, email, telegram, twitterHandle, description, tags } = body as RegisterRequest;

    // Validate wallet
    const walletValidation = validateWalletAddress(wallet);
    if (!walletValidation.valid) {
      invalidField(res, walletValidation.error ?? 'Invalid wallet', 'wallet', 'invalid');
      return;
    }

    // Validate tags
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
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

    // Check if wallet already exists
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { wallet },
    });

    if (existingProvider) {
      return res.status(409).json({ error: 'Service provider with this wallet already exists' });
    }

    // Clean Twitter handle (remove @ if present)
    const cleanTwitterHandle = twitterHandle?.replace(/^@/, '').trim() || null;

    // Create service provider with tags
    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        wallet,
        email: email?.trim() || null,
        telegram: telegram?.trim() || null,
        twitterHandle: cleanTwitterHandle,
        description: description?.trim() || null,
        tags: {
          create: tags.map((tag) => ({
            tag: tag.trim(),
            isCustom: !isPredefinedTag(tag.trim()),
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    res.status(201).json({
      success: true,
      serviceProvider,
    });
  } catch (error) {
    console.error('Error registering service provider:', error);
    res.status(500).json({
      error: 'Failed to register service provider',
    });
  }
}
