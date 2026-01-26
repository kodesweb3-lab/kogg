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

// Allowed file types for documents
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file
const MAX_FILES = 10; // Maximum number of files per upload

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart/form-data using formidable
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      maxFiles: MAX_FILES,
    });

    const [fields, files] = await form.parse(req);
    
    // Get files from the parsed form
    const fileArray = files.documents || files.file || [];
    
    if (!Array.isArray(fileArray) || fileArray.length === 0) {
      return res.status(400).json({ 
        error: 'Missing files in form data. Use field name "documents" or "file".' 
      });
    }

    if (fileArray.length > MAX_FILES) {
      // Clean up uploaded files
      fileArray.forEach((file) => {
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      });
      return res.status(400).json({ 
        error: `Too many files. Maximum ${MAX_FILES} files allowed.` 
      });
    }

    const uploadResults = [];

    for (const file of fileArray) {
      if (!file.filepath) {
        continue;
      }

      // Validate file type
      const mimeType = file.mimetype || 'application/octet-stream';
      
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        // Clean up uploaded file
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        return res.status(400).json({ 
          error: `Invalid file type: ${file.originalFilename || 'unknown'}. Allowed types: PDF, images, documents.` 
        });
      }

      try {
        // Read file buffer
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Get original filename
        const originalFilename = file.originalFilename || 'document';
        
        // Determine file type from extension or mime type
        let fileType = 'document';
        if (mimeType.startsWith('image/')) {
          fileType = 'image';
        } else if (mimeType === 'application/pdf') {
          fileType = 'pdf';
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
          fileType = 'document';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
          fileType = 'spreadsheet';
        }

        // Clean up temporary file
        fs.unlinkSync(file.filepath);

        // Convert Buffer to File (Pinata SDK requires File object)
        const fileObj = new File([fileBuffer], originalFilename, { type: mimeType });

        // Upload to Pinata
        const uploadResult = await pinata.upload.public.file(fileObj);

        // Get the IPFS URL
        const documentUrl = `https://gateway.pinata.cloud/ipfs/${uploadResult.cid}`;

        uploadResults.push({
          url: documentUrl,
          name: originalFilename,
          type: fileType,
          cid: uploadResult.cid,
        });
      } catch (fileError) {
        // Clean up uploaded file on error
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        logger.error('Document upload error for file', fileError instanceof Error ? fileError : new Error(String(fileError)), {
          filename: file.originalFilename,
        });
        // Continue with other files instead of failing completely
      }
    }

    if (uploadResults.length === 0) {
      return res.status(400).json({ 
        error: 'No files were successfully uploaded.' 
      });
    }

    res.status(200).json({ 
      documents: uploadResults,
      count: uploadResults.length,
    });
  } catch (error) {
    logger.error('Documents upload error', error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/upload/documents',
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
          error: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB per file.` 
        });
      }
      if (error.message.includes('maxFiles')) {
        return res.status(400).json({ 
          error: `Too many files. Maximum ${MAX_FILES} files allowed.` 
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
      error: 'Unknown error occurred during documents upload' 
    });
  }
}
