# Kogaion Bot Worker

Worker application that manages Telegram bots for token communities.

## Setup

1. **Generate Prisma Client** (from main app directory):
   ```bash
   cd ../..  # Back to fun-launch root
   pnpm prisma generate
   ```
   This generates the Prisma client that the worker will use.

2. **Install dependencies**:
   ```bash
   cd apps/worker-bots
   pnpm install
   ```

3. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**:
   - `DATABASE_URL`: PostgreSQL connection string (same as main app)
   - `ENCRYPTION_KEY`: 32-byte hex key or any string for AES-GCM encryption (must match main app)
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API token

5. **Generate encryption key** (if not already set):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   **Important**: This key must be the same in both the main app and worker!

## Running

Development:
```bash
pnpm dev
```

Production:
```bash
pnpm build
pnpm start
```

## How It Works

1. Loads all ACTIVE bots from database
2. Decrypts bot tokens using ENCRYPTION_KEY
3. Starts Telegraf bots for each token
4. Uses HuggingFace API for AI responses
5. Reloads bots every 30 seconds to pick up new activations

## Security

- Bot tokens are never stored in plaintext
- All tokens are encrypted using AES-256-GCM
- Encryption key must match between main app and worker
