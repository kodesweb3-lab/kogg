import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import { requireJsonContentType, validationError } from '@/lib/apiErrors';

type CreateTokenRequest = {
  mint: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  metadataUri: string;
  dbcPool?: string;
  creatorWallet: string;
  tokenType?: 'MEMECOIN' | 'RWA';
  assetType?: string;
  assetDescription?: string;
  assetValue?: number;
  assetLocation?: string;
  documents?: Array<{ url: string; name: string; type: string }> | string; // Can be JSON string or array
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        mint,
        name,
        symbol,
        imageUrl,
        metadataUri,
        dbcPool,
        creatorWallet,
        tokenType,
        assetType,
        assetDescription,
        assetValue,
        assetLocation,
        documents,
      } = body as CreateTokenRequest;

      // Validate required fields
      const missing: { field: string; reason: 'missing' }[] = [];
      if (!mint) missing.push({ field: 'mint', reason: 'missing' });
      if (!name) missing.push({ field: 'name', reason: 'missing' });
      if (!symbol) missing.push({ field: 'symbol', reason: 'missing' });
      if (!metadataUri) missing.push({ field: 'metadataUri', reason: 'missing' });
      if (!creatorWallet) missing.push({ field: 'creatorWallet', reason: 'missing' });
      if (missing.length > 0) {
        validationError(
          res,
          'Missing required fields: mint, name, symbol, metadataUri, and creatorWallet are required',
          missing
        );
        return;
      }

      // Validate RWA fields if tokenType is RWA
      if (tokenType === 'RWA') {
        if (!assetType) {
          validationError(res, 'assetType is required for RWA tokens', [
            { field: 'assetType', reason: 'missing' },
          ]);
          return;
        }
        if (!assetDescription) {
          validationError(res, 'assetDescription is required for RWA tokens', [
            { field: 'assetDescription', reason: 'missing' },
          ]);
          return;
        }
      }

      const config = getConfig();

      // Parse documents if it's a string (JSON)
      let documentsData: any = null;
      if (documents) {
        if (typeof documents === 'string') {
          try {
            documentsData = JSON.parse(documents);
          } catch {
            documentsData = documents;
          }
        } else {
          documentsData = documents;
        }
      }

      // Create token in database with initial metrics
      const token = await prisma.token.create({
        data: {
          mint,
          name,
          symbol,
          imageUrl: imageUrl || null,
          metadataUri,
          dbcPool: dbcPool || null,
          creatorWallet,
          configKey: config.poolConfigKey,
          tokenType: tokenType || 'MEMECOIN',
          assetType: assetType || null,
          assetDescription: assetDescription || null,
          assetValue: assetValue || null,
          assetLocation: assetLocation || null,
          documents: documentsData ? documentsData : null,
          metrics: {
            create: {
              price: 0,
              mcap: 0,
              vol24h: 0,
              holders: 0,
            },
          },
        },
        include: {
          metrics: true,
        },
      });

      res.status(201).json({
        success: true,
        token,
      });
    } catch (error) {
      logger.error('Error creating token', error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/tokens',
        method: 'POST',
      });
      if (error instanceof Error) {
        // Handle unique constraint violation
        if (error.message.includes('Unique constraint')) {
          return res.status(409).json({
            error: 'Token with this mint address already exists',
          });
        }
        return res.status(500).json({
          error: `Failed to create token: ${error.message}`,
        });
      }
      return res.status(500).json({
        error: 'Unknown error occurred while creating token',
      });
    }
  } else if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        creatorWallet,
        tokenType,
        assetType,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Validate pagination
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        validationError(res, 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100', [
          { field: 'page', reason: 'invalid' },
          { field: 'limit', reason: 'invalid' },
        ]);
        return;
      }

      // Validate sortBy
      const validSortFields = ['createdAt', 'name', 'symbol', 'mint'];
      if (!validSortFields.includes(sortBy as string)) {
        validationError(res, `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`, [
          { field: 'sortBy', reason: 'invalid' },
        ]);
        return;
      }

      // Validate sortOrder
      if (sortOrder !== 'asc' && sortOrder !== 'desc') {
        validationError(res, "Invalid sortOrder. Must be 'asc' or 'desc'", [
          { field: 'sortOrder', reason: 'invalid' },
        ]);
        return;
      }

      // Build where clause
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { symbol: { contains: search as string, mode: 'insensitive' } },
          { mint: { contains: search as string, mode: 'insensitive' } },
          { assetDescription: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      if (creatorWallet) {
        where.creatorWallet = creatorWallet as string;
      }
      if (tokenType) {
        where.tokenType = tokenType as string;
      }
      if (assetType) {
        where.assetType = assetType as string;
      }

      // Get tokens with pagination
      const [tokens, total] = await Promise.all([
        prisma.token.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: {
            [sortBy as string]: sortOrder as 'asc' | 'desc',
          },
          include: {
            metrics: true,
          },
        }),
        prisma.token.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: tokens,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Error fetching tokens', error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/tokens',
        method: 'GET',
      });
      return res.status(500).json({
        error: 'Failed to fetch tokens',
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
