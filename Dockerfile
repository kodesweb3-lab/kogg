# Use Node 20.19 which is compatible with @prisma/client@7.2.0
FROM node:20.19-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Set working directory
WORKDIR /app

# Copy all necessary files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY scaffolds ./scaffolds
COPY studio ./studio

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm build

# Production stage
FROM node:20.19-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy built application
COPY --from=base /app ./

# Expose port (Railway will override with dynamic port)
EXPOSE 3000

ENV NODE_ENV=production

# Push schema to database and start the application
CMD ["sh", "-c", "cd scaffolds/fun-launch && npx prisma db push --skip-generate && pnpm start -p ${PORT:-3000}"]
