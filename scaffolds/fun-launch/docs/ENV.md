# Environment Variables Reference

Complete reference for all Kogaion environment variables.

## Table of Contents

1. [Required Variables](#required-variables)
2. [Optional Variables](#optional-variables)
3. [Service-Specific Variables](#service-specific-variables)
4. [Variable Validation](#variable-validation)

---

## Required Variables

### `PINATA_JWT`

**Description**: Pinata IPFS API JWT token for image and metadata uploads.

**Type**: String (JWT token)

**Where Used**: Web service (`src/pages/api/upload/*`)

**How to Get**:
1. Sign up at https://app.pinata.cloud
2. Go to "Developers" → "API Keys"
3. Create a new API key
4. Copy the JWT token

**Example**:
```bash
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security**: High - Keep secret, never commit

---

### `RPC_URL`

**Description**: Solana RPC endpoint URL (mainnet-beta).

**Type**: String (URL)

**Where Used**: Web service (all Solana interactions)

**Recommended Providers**:
- Helius: https://www.helius.dev
- QuickNode: https://www.quicknode.com
- Alchemy: https://www.alchemy.com

**Example**:
```bash
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

**Validation**: Must be non-empty, valid URL

**Security**: Medium - RPC key may be sensitive

---

### `POOL_CONFIG_KEY`

**Description**: Meteora DBC pool configuration public key.

**Type**: String (Solana PublicKey, base58)

**Where Used**: Web service (`src/pages/api/create-pool-transaction.ts`)

**Default**: `BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t`

**What It Enforces**:
- quoteMint: wSOL (`So11111111111111111111111111111111111111112`)
- feeClaimer: Treasury (`5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA`)
- leftoverReceiver: Treasury
- Trading fee: 1.5% (150 bps)
- creatorTradingFeePercentage: 0%

**Example**:
```bash
POOL_CONFIG_KEY=BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t
```

**Validation**: Must be valid Solana PublicKey format

**Security**: Low - Public key, can be committed

---

### `TREASURY_SECRET_KEY` (optional)

**Description**: Base58-encoded secret key for the DBC fee claimer (treasury) wallet (`5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA`). Pool creation requires this wallet to sign the transaction; the server adds the signature when sending.

**Type**: String (base58 secret key, 64 bytes decoded)

**Where Used**: Web service (`src/pages/api/send-transaction.ts`) — only when the transaction is a create-pool that needs the treasury signature.

**When to set**: Required for token launch (create pool) to succeed. If not set, users will see "Missing signature for public key [5hDrp...]".

**Example** (do not use in production):
```bash
TREASURY_SECRET_KEY=your_base58_secret_key_for_5hDrp_wallet
```

**Security**: Critical - Never commit. Store in env/secrets only.

---

### `DATABASE_URL`

**Description**: PostgreSQL connection string.

**Type**: String (PostgreSQL URI)

**Where Used**: Web service + Worker service

**Format**:
```
postgresql://user:password@host:port/database?sslmode=require
```

**Example (Local)**:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/kogaion
```

**Example (Railway)**:
```bash
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Validation**: Must be valid PostgreSQL connection string

**Security**: High - Contains credentials, never commit

**Note**: Railway automatically provides this when you add PostgreSQL plugin.

---

### `ENCRYPTION_KEY`

**Description**: AES-256-GCM encryption key for bot tokens.

**Type**: String (32 bytes hex or any string)

**Where Used**: Web service + Worker service (MUST be identical)

**How to Generate**:
```bash
npm run generate:encryption-key
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example (64 hex characters)**:
```bash
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Example (any string)**:
```bash
ENCRYPTION_KEY=my-super-secret-encryption-key-2024
```

**Validation**: No validation (any string works, but 32 bytes hex recommended)

**Security**: **CRITICAL** - Must be kept secret, never commit

**Important**: 
- Use the **SAME** key in web and worker services
- If compromised, all bot tokens must be re-encrypted

---

### `HUGGINGFACE_API_KEY`

**Description**: HuggingFace API key for AI bot responses.

**Type**: String (API token)

**Where Used**: Worker service (`apps/worker-bots/src/huggingface.ts`)

**How to Get**:
1. Sign up at https://huggingface.co
2. Go to "Settings" → "Access Tokens"
3. Create a new token
4. Copy the token

**Example**:
```bash
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Validation**: No validation (any string works)

**Security**: High - Keep secret, never commit

---

## Optional Variables

### `NEXT_PUBLIC_WEBSITE_URL`

**Description**: Public website URL used in Twitter verification messages.

**Type**: String (URL)

**Where Used**: Web service (Twitter verification)

**Default**: `https://kogaion.fun`

**Example**:
```bash
NEXT_PUBLIC_WEBSITE_URL=https://kogaion.fun
```

**Security**: Low - Public URL, can be committed

---

### `NEXT_PUBLIC_TELEGRAM_URL`

**Description**: Public Telegram URL used in Twitter verification messages.

**Type**: String (URL)

**Where Used**: Web service (Twitter verification)

**Default**: `https://t.me/kogaionpack`

**Example**:
```bash
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/kogaionpack
```

**Security**: Low - Public URL, can be committed

---

### `NEXT_PUBLIC_TWITTER_URL`

**Description**: Public Twitter/X URL used in Twitter verification messages.

**Type**: String (URL)

**Where Used**: Web service (Twitter verification)

**Default**: `https://x.com/KogaionSol`

**Example**:
```bash
NEXT_PUBLIC_TWITTER_URL=https://x.com/KogaionSol
```

**Security**: Low - Public URL, can be committed

---

### Twitter/X API Variables (Optional)

**Description**: Twitter API credentials for service provider verification feature.

**Required For**: Service provider Twitter verification

**How to Get**:
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new app or use existing app
3. Get API keys and tokens from "Keys and tokens" tab

**Variables**:
- `TWITTER_CLIENT_ID` - OAuth 2.0 Client ID
- `TWITTER_CLIENT_SECRET` - OAuth 2.0 Client Secret
- `TWITTER_CALLBACK_URL` - OAuth callback URL (must match app settings)
- `TWITTER_ACCESS_TOKEN` - Access token for API calls
- `TWITTER_ACCESS_TOKEN_SECRET` - Access token secret

**Example**:
```bash
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=https://kogaion.fun/api/twitter/callback
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

**Security**: High - Keep secret, never commit

**Note**: These are optional. Service provider registration works without Twitter verification, but verification adds a verified badge.

---

### `ALLOWED_ORIGIN`

**Description**: CORS allowed origin (default: `*`).

**Type**: String (URL or `*`)

**Where Used**: Web service (`next.config.ts`)

**Example**:
```bash
ALLOWED_ORIGIN=https://kogaion.xyz
```

**Default**: `*` (allows all origins)

**Security**: Low - Public configuration

---

### `NODE_ENV`

**Description**: Node.js environment.

**Type**: String (`development` | `production` | `test`)

**Where Used**: All services

**Example**:
```bash
NODE_ENV=production
```

**Default**: `development` (if not set)

**Security**: Low - Public configuration

**Note**: Affects logging format and build behavior.

---

### `PORT`

**Description**: Port for worker service health check server.

**Type**: Number

**Where Used**: Worker service (`apps/worker-bots/src/health-server.ts`)

**Example**:
```bash
PORT=3001
```

**Default**: `3001`

**Security**: Low - Public configuration

**Note**: Railway auto-assigns ports, but you can override.

---

## Service-Specific Variables

### Web Service (Next.js)

Required:
- `PINATA_JWT`
- `RPC_URL`
- `POOL_CONFIG_KEY`
- `DATABASE_URL`
- `ENCRYPTION_KEY`

Optional:
- `ALLOWED_ORIGIN`
- `NODE_ENV`

### Worker Service (Node.js)

Required:
- `DATABASE_URL`
- `ENCRYPTION_KEY`
- `HUGGINGFACE_API_KEY`

Optional:
- `PORT`
- `NODE_ENV`

---

## Variable Validation

### Validation on Startup

The web service validates environment variables on startup:

**Location**: `src/lib/config.ts`

**Validated Variables**:
- `RPC_URL`: Must be non-empty
- `POOL_CONFIG_KEY`: Must be valid Solana PublicKey

**Error Handling**:
- Throws error if validation fails
- Error message indicates which variable is invalid

### Validation in Worker

The worker service validates on startup:

**Location**: `apps/worker-bots/src/index.ts`

**Validated Variables**:
- `DATABASE_URL`: Must be set
- `ENCRYPTION_KEY`: Must be set
- `HUGGINGFACE_API_KEY`: Must be set

**Error Handling**:
- Throws error if validation fails
- Process exits with code 1

---

## Environment Variable Checklist

### Development

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required variables
- [ ] Generate `ENCRYPTION_KEY`
- [ ] Get `PINATA_JWT` from Pinata
- [ ] Get `HUGGINGFACE_API_KEY` from HuggingFace
- [ ] Set up local PostgreSQL or use Railway
- [ ] Verify `.env` is in `.gitignore`

### Production (Railway)

- [ ] Set `PINATA_JWT` in web service
- [ ] Set `RPC_URL` in web service
- [ ] Set `POOL_CONFIG_KEY` in web service (or use default)
- [ ] Set `DATABASE_URL` in web and worker services
- [ ] Set `ENCRYPTION_KEY` in web and worker services (SAME KEY)
- [ ] Set `HUGGINGFACE_API_KEY` in worker service
- [ ] Set `NODE_ENV=production` in all services
- [ ] Set `ALLOWED_ORIGIN` if needed (web service)
- [ ] Verify no secrets are in Git

---

## Troubleshooting

### Issue: "RPC_URL is required"

**Solution**: Set `RPC_URL` environment variable.

### Issue: "POOL_CONFIG_KEY must be a valid Solana public key"

**Solution**: Verify `POOL_CONFIG_KEY` is a valid base58 Solana address.

### Issue: "ENCRYPTION_KEY environment variable is required"

**Solution**: Set `ENCRYPTION_KEY` in both web and worker services.

### Issue: Bot tokens fail to decrypt

**Solution**: Verify `ENCRYPTION_KEY` is **identical** in web and worker services.

### Issue: Database connection fails

**Solution**: 
1. Verify `DATABASE_URL` is correct
2. Check database is accessible
3. Verify SSL mode if required

---

**Last Updated**: 2024-01-01
