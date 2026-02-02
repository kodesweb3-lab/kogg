import { NextApiRequest, NextApiResponse } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kogaion.fun';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    skillUrl: `${BASE_URL}/skill.md`,
    playgroundUrl: `${BASE_URL}/agents-playground`,
    baseUrl: BASE_URL,
    capabilities: [
      'playground',
      'projects',
      'marketplace',
      'tokens',
      'twitter_verification',
    ],
  });
}
