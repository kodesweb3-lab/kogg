import type { NextApiRequest, NextApiResponse } from 'next';
import { createAgentTokenEndpoint } from '@/lib/token-launch-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return createAgentTokenEndpoint(req, res);
  }
  
  res.setHeader('Allow', ['POST']);
  return res.status(405).end('Method Not Allowed');
}
