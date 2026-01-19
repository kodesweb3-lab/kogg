import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { getConfig } from '@/lib/config';
import { prisma } from '@/lib/db';

type HealthCheck = {
  name: string;
  status: 'ok' | 'error';
  message?: string;
  latency?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks: HealthCheck[] = [];
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    checks.push({
      name: 'database',
      status: 'ok',
      latency: dbLatency,
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    overallStatus = 'unhealthy';
  }

  // Check RPC connection
  try {
    const rpcStart = Date.now();
    const config = getConfig();
    const connection = new Connection(config.rpcUrl, 'confirmed');
    await connection.getVersion();
    const rpcLatency = Date.now() - rpcStart;
    checks.push({
      name: 'rpc',
      status: 'ok',
      latency: rpcLatency,
    });
  } catch (error) {
    checks.push({
      name: 'rpc',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    overallStatus = overallStatus === 'healthy' ? 'degraded' : 'unhealthy';
  }

  // Check Pinata (optional - only if PINATA_JWT is set)
  const pinataJwt = process.env.PINATA_JWT;
  if (pinataJwt) {
    try {
      const pinataStart = Date.now();
      // Simple connectivity check - try to access Pinata API
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      const pinataLatency = Date.now() - pinataStart;
      
      if (response.ok) {
        checks.push({
          name: 'pinata',
          status: 'ok',
          latency: pinataLatency,
        });
      } else {
        checks.push({
          name: 'pinata',
          status: 'error',
          message: `HTTP ${response.status}`,
        });
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    } catch (error) {
      checks.push({
        name: 'pinata',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      if (overallStatus === 'healthy') overallStatus = 'degraded';
    }
  }

  const statusCode = overallStatus === 'unhealthy' ? 503 : overallStatus === 'degraded' ? 200 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    service: 'web',
  });
}
