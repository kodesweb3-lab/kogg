import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata';
import { logger } from '@/lib/logger';

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
};

type Metadata = {
  name: string;
  symbol: string;
  description?: string;
  image: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, symbol, description, imageUrl } = req.body as MetadataRequest;

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

    // Create metadata object
    const metadata: Metadata = {
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      image: imageUrl,
    };

    // Add description if provided
    if (description && description.trim()) {
      metadata.description = description.trim();
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
