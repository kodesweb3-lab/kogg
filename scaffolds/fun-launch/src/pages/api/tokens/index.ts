import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/logger';

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
    try {
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
      } = req.body as CreateTokenRequest;

      // Validate required fields
      if (!mint || !name || !symbol || !metadataUri || !creatorWallet) {
        return res.status(400).json({
          error: 'Missing required fields: mint, name, symbol, metadataUri, and creatorWallet are required',
        });
      }

      // Validate RWA fields if tokenType is RWA
      if (tokenType === 'RWA') {
        if (!assetType) {
          return res.status(400).json({
            error: 'assetType is required for RWA tokens',
          });
        }
        if (!assetDescription) {
          return res.status(400).json({
            error: 'assetDescription is required for RWA tokens',
          });
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

      // Validate sortBy
      const validSortFields = ['createdAt', 'name', 'symbol', 'mint'];
      if (!validSortFields.includes(sortBy as string)) {
        return res.status(400).json({
          error: `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`,
        });
      }

      // Validate sortOrder
      if (sortOrder !== 'asc' && sortOrder !== 'desc') {
        return res.status(400).json({
          error: "Invalid sortOrder. Must be 'asc' or 'desc'",
        });
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
