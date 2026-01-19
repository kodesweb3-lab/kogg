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

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start the Next.js application
CMD ["pnpm", "--filter", "@meteora-invent/scaffold/fun-launch", "start"]
