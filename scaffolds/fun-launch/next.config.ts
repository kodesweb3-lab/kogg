import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enable source maps in production for better error debugging
  productionBrowserSourceMaps: true,
  
  // Ignore ESLint and TypeScript errors during builds for faster deployments
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Healthcheck: /health and /api/health both return same JSON (Railway may use either path)
  async rewrites() {
    return [{ source: '/health', destination: '/api/health' }];
  },

  // CORS headers for API routes (agents e.g. Moltbook/OpenClaw can call from any origin)
  // Production: set ALLOWED_ORIGIN=* or leave unset to allow cross-origin API calls
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGIN || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
