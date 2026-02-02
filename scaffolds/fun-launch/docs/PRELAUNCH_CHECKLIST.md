# Pre-Launch Audit Checklist

This checklist must be completed before launching Kogaion to production. **The plan fails if any required items are missing.**

## Critical Requirements (MUST PASS)

### 1. Environment Variables

- [ ] **All required environment variables set in Railway**
  - `PINATA_JWT` (web service)
  - `RPC_URL` (web service)
  - `POOL_CONFIG_KEY` (web service, or using default)
  - `DATABASE_URL` (web + worker services)
  - `ENCRYPTION_KEY` (web + worker services, **MUST BE IDENTICAL**)
  - `HUGGINGFACE_API_KEY` (worker service)
  - `NODE_ENV=production` (all services)

- [ ] **No secrets committed to Git**
  - Verify `.env` files are in `.gitignore`
  - Check Git history for any committed secrets
  - All secrets stored in Railway environment variables

- [ ] **Encryption key is secure**
  - `ENCRYPTION_KEY` is 32 bytes hex (64 characters) or strong random string
  - Same key used in web and worker services
  - Key generated using: `npm run generate:encryption-key`

**Files to check**: `.gitignore`, Railway environment variables, `src/lib/config.ts`

---

### 2. Database Setup

- [ ] **Database migrations applied**
  - Run: `railway run pnpm db:migrate` (or migrations run automatically)
  - Verify tables exist: `Token`, `Metric`, `BotPersona`, `TelegramBot`

- [ ] **Database connection works**
  - Health check shows database status: `ok`
  - Both web and worker services can connect

**Files to check**: `prisma/schema.prisma`, Railway database logs

---

### 3. Solana Configuration

- [ ] **RPC URL is set and accessible**
  - `RPC_URL` points to mainnet-beta
  - RPC provider is reliable (Helius, QuickNode recommended)
  - Health check shows RPC status: `ok`

- [ ] **Pool config key is correct**
  - `POOL_CONFIG_KEY=BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t`
  - Config key enforces correct settings (verified on-chain or in docs)

**Files to check**: `src/lib/config.ts`, `src/pages/api/create-pool-transaction.ts`

---

### 4. Pinata Configuration

- [ ] **Pinata JWT is valid**
  - `PINATA_JWT` is set in web service
  - JWT has public upload permissions
  - Health check shows Pinata status: `ok` (if configured)

- [ ] **Pinata account has sufficient quota**
  - Check Pinata dashboard for storage/quota limits
  - Verify free tier or paid plan is active

**Files to check**: Railway environment variables, `src/pages/api/upload/*.ts`

---

### 5. HuggingFace Configuration

- [ ] **HuggingFace API key is valid**
  - `HUGGINGFACE_API_KEY` is set in worker service
  - API key has inference permissions
  - Health check shows HuggingFace status: `ok` (if configured)

- [ ] **HuggingFace account has sufficient quota**
  - Check HuggingFace dashboard for API usage/quota

**Files to check**: Railway environment variables, `apps/worker-bots/src/huggingface.ts`

---

### 6. Payment Verification

- [ ] **Treasury wallet is correct**
  - Hardcoded: `5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA`
  - Verify this is the correct treasury address

- [ ] **Payment amount is correct**
  - Bot activation fee: 0.1 SOL (100,000,000 lamports)
  - Tolerance: 1000 lamports

- [ ] **Payment verification uses finalized commitment**
  - Transaction checked with `commitment: 'finalized'`
  - Balance change verified correctly

**Files to check**: `src/pages/api/bot/confirm.ts`

---

### 7. Security

- [ ] **Rate limiting is enabled**
  - Upload endpoints: 10 requests/minute
  - Bot activation: 5 requests/minute
  - Bot confirmation: 10 requests/minute

- [ ] **CORS is configured**
  - `ALLOWED_ORIGIN` set to your domain (or `*` for development)
  - CORS headers configured in `next.config.ts`

- [ ] **Logs don't leak secrets**
  - Structured logger sanitizes sensitive fields
  - No `console.log` with secrets
  - No error messages expose internals

- [ ] **Encryption is working**
  - Bot tokens encrypted before storage
  - Encryption/decryption tested
  - Same `ENCRYPTION_KEY` in web and worker

**Files to check**: `src/middleware.ts`, `next.config.ts`, `src/lib/logger.ts`, `src/lib/encryption.ts`

---

### 8. Health Checks

- [ ] **Web service health check works**
  - Endpoint: `/api/health`
  - Returns status: `healthy` or `degraded`
  - All checks pass (database, RPC, Pinata)

- [ ] **Worker service health check works**
  - Endpoint: `/health`
  - Returns status: `healthy` or `degraded`
  - All checks pass (database, HuggingFace)

**Files to check**: `src/pages/api/health.ts`, `apps/worker-bots/src/health.ts`

---

### 9. Build and Deployment

- [ ] **Build succeeds**
  - `pnpm build` completes without errors
  - TypeScript compiles: `pnpm typecheck`
  - Prisma client generates: `pnpm db:generate`

- [ ] **Services start correctly**
  - Web service: `pnpm start` (Next.js)
  - Worker service: `pnpm start` (Node.js)

- [ ] **Railway deployment successful**
  - Both services deployed
  - No build errors in Railway logs
  - Services are running

**Files to check**: `package.json`, Railway deployment logs

---

### 10. Functional Testing

- [ ] **Token launch works**
  - Upload image (Pinata)
  - Upload metadata (Pinata)
  - Create pool transaction
  - Token saved to database
  - Token appears in `/discover`

- [ ] **Trading page works**
  - Chart loads
  - Buy/sell panel works
  - Jupiter Terminal integration works

- [ ] **Bot activation works**
  - Create bot persona
  - Generate payment transaction
  - Pay 0.1 SOL to treasury
  - Verify payment on-chain (finalized)
  - Bot activates (status: `ACTIVE`)
  - Bot starts in worker
  - Bot responds in Telegram

**Files to check**: End-to-end testing, Railway logs

---

## Optional but Recommended

### 11. Monitoring

- [ ] **External monitoring set up**
  - UptimeRobot or similar pinging health endpoints
  - Alerts configured for downtime

- [ ] **Log aggregation**
  - Railway logs accessible
  - Structured logging working (JSON in production)

### 12. Documentation

- [ ] **Documentation is complete**
  - `docs/RAILWAY_DEPLOYMENT.md` reviewed
  - `docs/SECURITY.md` reviewed
  - `docs/ENV.md` reviewed
  - `README.md` updated

---

## Failure Criteria

**The plan FAILS if any of the following are missing:**

1. ❌ Required environment variables not set
2. ❌ Secrets committed to Git
3. ❌ Database migrations not applied
4. ❌ `ENCRYPTION_KEY` different in web and worker
5. ❌ Payment verification incorrect (wrong wallet or amount)
6. ❌ Health checks failing
7. ❌ Build fails
8. ❌ Services don't start
9. ❌ Token launch doesn't work
10. ❌ Bot activation doesn't work

---

## Fixes for Common Issues

### Issue: Encryption key mismatch

**Fix**: 
1. Set identical `ENCRYPTION_KEY` in both services
2. Re-encrypt all bot tokens (if any exist)

**Files**: Railway environment variables

---

### Issue: Payment verification fails

**Fix**:
1. Verify treasury wallet: `5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA`
2. Verify amount: 0.1 SOL (100,000,000 lamports)
3. Verify commitment: `finalized`

**Files**: `src/pages/api/bot/confirm.ts`

---

### Issue: Database connection fails

**Fix**:
1. Verify `DATABASE_URL` is set in both services
2. Check database is running
3. Verify SSL mode if required

**Files**: Railway environment variables, `src/lib/db.ts`

---

### Issue: Health checks fail

**Fix**:
1. Check individual service health (database, RPC, etc.)
2. Verify environment variables are set
3. Check service logs for errors

**Files**: `src/pages/api/health.ts`, `apps/worker-bots/src/health.ts`

---

### Issue: Rate limiting not working

**Fix**:
1. Verify middleware is configured: `src/middleware.ts`
2. Check matcher includes correct routes
3. Test rate limiting with multiple requests

**Files**: `src/middleware.ts`, `next.config.ts`

---

## Final Verification

Before marking as "ready for launch":

1. ✅ All critical requirements checked
2. ✅ All functional tests pass
3. ✅ All services healthy
4. ✅ No secrets in Git
5. ✅ Documentation complete
6. ✅ Monitoring set up (optional)

---

**Last Updated**: 2024-01-01

**Status**: ⚠️ **FAIL** if any required items are missing
