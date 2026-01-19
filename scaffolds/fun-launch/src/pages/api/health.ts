import { NextApiRequest, NextApiResponse } from 'next';

// Simple health check - just returns OK to pass Railway healthcheck
// Database and other service checks can be added to a separate /api/status endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Always return healthy for basic healthcheck
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'kogaion-web',
  });
}
