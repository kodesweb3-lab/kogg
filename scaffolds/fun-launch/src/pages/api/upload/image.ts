import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata';
import formidable from 'formidable';
import fs from 'fs';
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

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle multipart/form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart/form-data using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB (increased from 2MB)
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Get the file from the parsed form
    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'Missing file in form data. Use field name "file".' });
    }

    const file = fileArray[0];
    
    if (!file.filepath) {
      return res.status(400).json({ error: 'Invalid file upload' });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif', 'image/webp'];
    const mimeType = file.mimetype || 'application/octet-stream';
    
    if (!allowedTypes.includes(mimeType)) {
      // Clean up uploaded file
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Get original filename
    const originalFilename = file.originalFilename || 'image';
    
    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Convert Buffer to File (Pinata SDK requires File object)
    // In Node.js 18+, File is available globally
    const fileObj = new File([fileBuffer], originalFilename, { type: mimeType });

    // Upload to Pinata
    const uploadResult = await pinata.upload.public.file(fileObj);

    // Get the IPFS URL
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${uploadResult.cid}`;

    res.status(200).json({ 
      imageUrl,
      cid: uploadResult.cid,
    });
  } catch (error) {
    logger.error('Image upload error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/upload/image',
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('PINATA_JWT')) {
        return res.status(500).json({ 
          error: 'Server configuration error: Pinata JWT not configured' 
        });
      }
      if (error.message.includes('maxFileSize') || error.message.includes('size') || error.message.includes('limit')) {
        return res.status(400).json({ 
          error: 'File size too large. Maximum size is 10MB.' 
        });
      }
      if (error.message.includes('ENOENT') || error.message.includes('file')) {
        return res.status(400).json({ 
          error: 'File processing error. Please try again.' 
        });
      }
      return res.status(500).json({ 
        error: `Upload failed: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: 'Unknown error occurred during image upload' 
    });
  }
}
