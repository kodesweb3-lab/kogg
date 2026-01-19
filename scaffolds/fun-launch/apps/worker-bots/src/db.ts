import { PrismaClient } from '@prisma/client';

// Prisma client for worker app
// Note: The Prisma client must be generated from the main app's schema
// Run from fun-launch root: pnpm prisma generate
// The worker will use the generated client from node_modules
// Prisma reads DATABASE_URL automatically from environment variables
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
