# Railway Deployment Guide for Kogaion

This guide provides step-by-step instructions for deploying Kogaion to Railway.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Service Configuration](#service-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository with Kogaion code
- Solana RPC endpoint (recommended: Helius, QuickNode)
- Pinata account and JWT token
- HuggingFace account and API key

---

## Project Setup

### Step 1: Create Railway Project

1. Log in to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select the repository containing Kogaion
6. Railway will create a new project

---

## Database Setup

### Step 2: Add PostgreSQL Plugin

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. **Important**: Note the `DATABASE_URL` that Railway provides (you'll need this later)

---

## Service Configuration

Kogaion requires **3 services**:

1. **Web Service** (Next.js app)
2. **Worker Service** (Telegram bots)
3. **PostgreSQL** (already added above)

### Step 3: Create Web Service

1. In Railway project, click "New" → "GitHub Repo"
2. Select the same repository
3. Railway will detect it as a service
4. Configure the service:
   - **Name**: `kogaion-web` (or any name you prefer)
   - **Root Directory**: Leave empty (deploys from root)
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Healthcheck Path**: `/api/health` (or `/health` — both return the same JSON via rewrite)
   - **Healthcheck Timeout**: Set to **60–120 seconds** so the first request after cold start can complete (Next.js may be slow to respond on first hit)
   - **Port**: Railway auto-detects (Next.js uses PORT env var)

### Step 4: Create Worker Service

1. In Railway project, click "New" → "GitHub Repo"
2. Select the same repository
3. Configure the service:
   - **Name**: `kogaion-worker-bots`
   - **Root Directory**: `apps/worker-bots`
   - **Build Command**: `cd ../.. && pnpm install && cd apps/worker-bots && pnpm build`
   - **Start Command**: `pnpm start`
   - **Healthcheck Path**: `/health` (port 3001 by default)
   - **Port**: `3001` (or set PORT env var)

**Note**: The worker service needs access to the same database and environment variables as the web service.

---

## Environment Variables

### Step 5: Configure Environment Variables

For **each service** (web and worker), set the following environment variables in Railway:

#### Required Variables

```bash
# Pinata IPFS Storage
PINATA_JWT=your_pinata_jwt_token_here

# Solana RPC URL (mainnet-beta)
RPC_URL=https://your-rpc-url.com

# DBC Pool Configuration Key
POOL_CONFIG_KEY=BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t

# Database URL (from PostgreSQL plugin)
DATABASE_URL=postgresql://user:password@host:port/database
# ⚠️ IMPORTANT: Use the DATABASE_URL from Railway's Postgres plugin

# Encryption Key (32 bytes hex or any string)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_32_byte_hex_key_here

# HuggingFace API Key
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Node Environment
NODE_ENV=production
```

#### Optional Variables

```bash
# CORS Allowed Origin (default: *)
ALLOWED_ORIGIN=https://your-domain.com

# Worker Port (default: 3001)
PORT=3001
```

### How to Set Environment Variables in Railway

1. Click on a service (web or worker)
2. Go to "Variables" tab
3. Click "New Variable"
4. Enter variable name and value
5. Click "Add"

**Important**: 
- Set `DATABASE_URL` for both web and worker services
- Use the **same** `ENCRYPTION_KEY` in both services
- Never commit secrets to Git

### Step 6: Link Database to Services

1. Click on the PostgreSQL service
2. Go to "Connect" tab
3. Copy the `DATABASE_URL`
4. In each service (web and worker), add `DATABASE_URL` as an environment variable with this value

Alternatively, Railway may auto-inject `DATABASE_URL` if you add the database as a "Resource" to each service.

---

## Database Migrations

### Step 7: Run Database Migrations

**Option A: Using Railway CLI (Recommended)**

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run migration:
   ```bash
   railway run pnpm db:migrate
   ```

**Option B: Using Railway One-Click Deploy Script**

1. In Railway web service, go to "Settings"
2. Add a "Deploy Hook" or use "Deploy" → "Manual Deploy"
3. Before first deploy, run migrations manually via CLI (Option A)

**Option C: Using Railway Service Command**

1. In Railway web service, go to "Settings" → "Deploy"
2. Add a custom deploy command that runs migrations:
   ```
   pnpm db:migrate && pnpm start
   ```
   ⚠️ **Warning**: This runs migrations on every deploy. Only use if you're confident.

**Recommended**: Use Option A (CLI) for initial setup, then migrations run automatically via `postinstall` script in production.

### Verify Migrations

After running migrations, verify tables exist:

1. Connect to Railway PostgreSQL via Railway's database interface
2. Or use Railway CLI: `railway connect postgres`
3. Run: `\dt` to list tables
4. You should see: `Token`, `Metric`, `BotPersona`, `TelegramBot`

---

## Verification

### Step 8: Verify Deployment

#### 8.1: Check Health Endpoints

**Web Service:**
```bash
curl https://your-web-service.railway.app/api/health
# or
curl https://your-web-service.railway.app/health
```

Expected response (both paths):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "kogaion-web"
}
```

**Worker Service:**
```bash
curl https://your-worker-service.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": [
    { "name": "database", "status": "ok", "latency": 5 },
    { "name": "huggingface", "status": "ok", "latency": 500 }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "worker-bots"
}
```

#### 8.2: Test Token Launch

1. Open your web app URL
2. Connect wallet
3. Create a test token:
   - Upload image (should use Pinata)
   - Fill in name, symbol, description
   - Launch token
4. Verify token appears in `/discover` page
5. Check database: token should be saved in `Token` table

#### 8.3: Test Bot Activation

1. Navigate to a token's page
2. Activate a bot:
   - Provide BotFather token
   - Configure persona
   - Pay 0.1 SOL to treasury
3. Verify bot activates:
   - Check database: `TelegramBot` status should be `ACTIVE`
   - Check worker logs: bot should start
   - Test bot in Telegram: send a message

#### 8.4: Verify Trading Page

1. Navigate to a token's trading page
2. Verify:
   - Chart loads
   - Buy/sell panel works
   - Jupiter Terminal integration works

---

## Troubleshooting

### Issue: Web Healthcheck Fails on Railway

**Symptoms**: Railway reports health check failed; deployment marked unhealthy.

**Solutions**:
1. **Path**: Use **Health Check Path** `/api/health` or `/health` (both work; `/health` rewrites to `/api/health`).
2. **Timeout**: Set **Healthcheck Timeout** to **60–120 seconds**. Next.js can be slow on first request after cold start; a short timeout (e.g. 10s) may cause false failures.
3. **Port**: Ensure the service uses Railway’s `PORT` (Next.js reads it by default).
4. **Verify manually**: After deploy, run `curl https://your-app.railway.app/api/health` and confirm you get `{"status":"healthy",...}` with HTTP 200.

### Issue: Database Connection Failed

**Symptoms**: Health check shows database error

**Solutions**:
1. Verify `DATABASE_URL` is set correctly in both services
2. Check PostgreSQL service is running
3. Verify database migrations ran successfully
4. Check Railway logs: `railway logs`

### Issue: Worker Service Not Starting

**Symptoms**: Worker health check fails

**Solutions**:
1. Verify all environment variables are set (especially `ENCRYPTION_KEY`, `HUGGINGFACE_API_KEY`)
2. Check worker logs: `railway logs --service kogaion-worker-bots`
3. Verify `DATABASE_URL` is accessible from worker
4. Check Prisma client is generated: `pnpm db:generate` in worker directory

### Issue: Pinata Upload Fails

**Symptoms**: Image/metadata upload returns 500 error

**Solutions**:
1. Verify `PINATA_JWT` is set correctly
2. Check Pinata account has available storage/quota
3. Verify JWT token has correct permissions (public upload)
4. Check Railway logs for detailed error

### Issue: Bot Not Responding

**Symptoms**: Bot activated but doesn't respond in Telegram

**Solutions**:
1. Check worker logs for bot errors
2. Verify `HUGGINGFACE_API_KEY` is valid
3. Check bot token is correct (BotFather)
4. Verify encryption/decryption works (same `ENCRYPTION_KEY` in both services)
5. Check Telegram bot is started: look for "Bot started" log message

### Issue: RPC Connection Timeout

**Symptoms**: Health check shows RPC error

**Solutions**:
1. Verify `RPC_URL` is correct and accessible
2. Check RPC provider status
3. Consider using a more reliable RPC (Helius, QuickNode)
4. Verify RPC supports mainnet-beta

### Issue: Build Fails

**Symptoms**: Railway build fails

**Solutions**:
1. Check build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Check Prisma schema is valid: `pnpm db:generate`
4. Verify TypeScript compiles: `pnpm typecheck`
5. Check Node version compatibility (Railway uses Node 18+ by default)

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Health checks passing for both services
- [ ] Test token launch works
- [ ] Test bot activation works
- [ ] Trading page loads and works
- [ ] CORS configured for your domain (if needed)
- [ ] Rate limiting enabled (default: enabled)
- [ ] Logs not leaking sensitive data
- [ ] Encryption key is secure and same in both services
- [ ] RPC endpoint is reliable and has sufficient rate limits
- [ ] Pinata account has sufficient storage/quota
- [ ] HuggingFace API key has sufficient quota

---

## Scaling

### Horizontal Scaling

Railway supports automatic scaling. For high traffic:

1. Enable auto-scaling in service settings
2. Consider using Railway's "Replicas" feature
3. Monitor database connection pool limits

### Database Scaling

- Railway PostgreSQL can be upgraded for more resources
- Consider connection pooling (Prisma handles this automatically)
- Monitor database performance in Railway dashboard

---

## Monitoring

### Railway Logs

View logs in Railway dashboard or via CLI:
```bash
railway logs --service kogaion-web
railway logs --service kogaion-worker-bots
```

### Health Checks

Monitor health endpoints:
- Web: `/api/health`
- Worker: `/health`

Set up external monitoring (e.g., UptimeRobot) to ping these endpoints.

---

## Support

For issues:
1. Check Railway logs
2. Review this guide's troubleshooting section
3. Check GitHub issues
4. Review Railway documentation: https://docs.railway.app

---

**Last Updated**: 2024-01-01
