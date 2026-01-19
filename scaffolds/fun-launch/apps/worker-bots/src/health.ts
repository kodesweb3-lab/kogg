import { prisma } from './db.js';

type HealthCheck = {
  name: string;
  status: 'ok' | 'error';
  message?: string;
  latency?: number;
};

export async function checkHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
  service: string;
}> {
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

  // Check HuggingFace API
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (hfApiKey) {
    try {
      const hfStart = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await globalThis.fetch('https://router.huggingface.co/hf-inference/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: {
            max_length: 10,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const hfLatency = Date.now() - hfStart;

      if (response.ok || response.status === 503) {
        // 503 means model is loading, but API is reachable
        checks.push({
          name: 'huggingface',
          status: 'ok',
          latency: hfLatency,
          message: response.status === 503 ? 'Model loading' : undefined,
        });
      } else {
        checks.push({
          name: 'huggingface',
          status: 'error',
          message: `HTTP ${response.status}`,
        });
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    } catch (error) {
      checks.push({
        name: 'huggingface',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      if (overallStatus === 'healthy') overallStatus = 'degraded';
    }
  }

  return {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    service: 'worker-bots',
  };
}
