import { NextApiRequest, NextApiResponse } from 'next';

/** @deprecated Persona preview for token bot has been removed. This endpoint returns 410 Gone. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({
    error: 'Deprecated',
    code: 'DEPRECATED',
    message: 'Persona preview is no longer available. This API has been removed.',
  });
}
