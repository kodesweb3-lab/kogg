import http from 'http';
import { checkHealth } from './health.js';
import { logger } from './logger.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const server = http.createServer(async (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    try {
      const health = await checkHealth();
      const statusCode = health.status === 'unhealthy' ? 503 : 200;
      
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

export function startHealthServer() {
  server.listen(PORT, () => {
    logger.info(`Health check server listening on port ${PORT}`, { port: PORT });
  });

  return server;
}
