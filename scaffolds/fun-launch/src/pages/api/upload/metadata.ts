import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata';
import { logger } from '@/lib/logger';
import { BASE_URL } from '@/constants';

// Environment variables
const PINATA_JWT = process.env.PINATA_JWT as string;

if (!PINATA_JWT) {
  throw new Error('Missing required environment variable: PINATA_JWT');
}

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
});

// Types
type MetadataRequest = {
  name: string;
  symbol: string;
  description?: string;
  imageUrl: string;
  tokenType?: 'MEMECOIN' | 'RWA';
  assetType?: string;
  assetDescription?: string;
  assetValue?: number;
  assetLocation?: string;
  documents?: Array<{ url: string; name: string; type: string }>;
};

type Metadata = {
  name: string;
  symbol: string;
  description?: string;
  image: string;
  tokenType?: 'MEMECOIN' | 'RWA';
  assetType?: string;
  assetDescription?: string;
  assetValue?: number;
  assetLocation?: string;
  documents?: Array<{ url: string; name: string; type: string }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      name, 
      symbol, 
      description, 
      imageUrl,
      tokenType,
      assetType,
      assetDescription,
      assetValue,
      assetLocation,
      documents
    } = req.body as MetadataRequest;

    // Validate required fields
    if (!name || !symbol || !imageUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, symbol, and imageUrl are required' 
      });
    }

    // Validate name length
    if (name.length < 3) {
      return res.status(400).json({ 
        error: 'Name must be at least 3 characters long' 
      });
    }

    // Validate symbol length
    if (symbol.length < 1 || symbol.length > 10) {
      return res.status(400).json({ 
        error: 'Symbol must be between 1 and 10 characters long' 
      });
    }

    // Validate imageUrl format
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('ipfs://')) {
      return res.status(400).json({ 
        error: 'Invalid imageUrl format. Must be a valid HTTP/HTTPS URL or IPFS URI' 
      });
    }

    // Validate tokenType if provided
    if (tokenType && tokenType !== 'MEMECOIN' && tokenType !== 'RWA') {
      return res.status(400).json({ 
        error: 'Invalid tokenType. Must be either MEMECOIN or RWA' 
      });
    }

    // Create metadata object
    const metadata: Metadata = {
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      image: imageUrl,
    };

    // Add token type if provided
    if (tokenType) {
      metadata.tokenType = tokenType;
    }

    // Add description if provided
    if (description && description.trim()) {
      metadata.description = description.trim();
    }

    // Add RWA-specific fields if tokenType is RWA
    if (tokenType === 'RWA') {
      if (assetType) {
        metadata.assetType = assetType;
      }
      if (assetDescription && assetDescription.trim()) {
        metadata.assetDescription = assetDescription.trim();
        // Use asset description as main description if no description provided
        if (!metadata.description) {
          metadata.description = assetDescription.trim();
        }
      }
      if (assetValue !== undefined && assetValue !== null) {
        metadata.assetValue = assetValue;
      }
      if (assetLocation && assetLocation.trim()) {
        metadata.assetLocation = assetLocation.trim();
      }
      if (documents && Array.isArray(documents) && documents.length > 0) {
        metadata.documents = documents;
      }
    }

    // Add launchpad information to description
    const launchpadWebsite = BASE_URL;
    const launchpadTwitter = process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/KogaionSol';
    const launchpadText = `\n\nLaunched via Kogaion - ${launchpadWebsite} | ${launchpadTwitter}`;

    if (metadata.description) {
      metadata.description += launchpadText;
    } else {
      metadata.description = `Token launched via Kogaion${launchpadText}`;
    }

    // Convert metadata to JSON buffer
    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataBuffer = Buffer.from(metadataJson, 'utf-8');

    // Convert Buffer to File (Pinata SDK requires File object)
    // In Node.js 18+, File is available globally
    const fileName = `${symbol}-metadata.json`;
    const fileObj = new File([metadataBuffer], fileName, { type: 'application/json' });

    // Upload to Pinata
    const uploadResult = await pinata.upload.public.file(fileObj);

    // Get the IPFS URL (metadataUri)
    const metadataUri = `https://gateway.pinata.cloud/ipfs/${uploadResult.cid}`;

    res.status(200).json({ 
      metadataUri,
      cid: uploadResult.cid,
    });
  } catch (error) {
    logger.error('Metadata upload error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/upload/metadata',
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('PINATA_JWT')) {
        return res.status(500).json({ 
          error: 'Server configuration error: Pinata JWT not configured' 
        });
      }
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        return res.status(400).json({ 
          error: 'Invalid JSON in request body' 
        });
      }
      return res.status(500).json({ 
        error: `Upload failed: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred during metadata upload' 
    });
  }
}
