# Railway Deployment - Kogaion

## Quick Deploy

### 1. Deploy from GitHub
1. Go to [railway.app](https://railway.app) → "New Project" → "Deploy from GitHub repo"
2. Select `kodesweb3-lab/kogg`
3. Railway auto-detects Dockerfile and builds

### 2. Add PostgreSQL
1. Click "New" → "Database" → "PostgreSQL"
2. `DATABASE_URL` is set automatically
3. Database tables are created automatically on first deploy via `prisma db push`

### 3. Set Environment Variables
Service → Variables → Add these:

```
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
PINATA_JWT=your_pinata_jwt_token
ENCRYPTION_KEY=your_64_character_hex_key
HUGGINGFACE_API_KEY=hf_your_key
```

**Required:**
- `RPC_URL` - Solana RPC endpoint (Helius, QuickNode, etc.)
- `DATABASE_URL` - Auto-set by PostgreSQL addon

**Optional:**
- `PINATA_JWT` - For IPFS image uploads
- `ENCRYPTION_KEY` - For Telegram bot token encryption (64 hex chars)
- `HUGGINGFACE_API_KEY` - For AI chat features

### 4. Enable Public Networking
1. Settings → Networking → Enable "Public Networking"
2. Click "Generate Domain"
3. Wait for deployment to complete

---

## Verification

After deploy, check:
- `https://your-domain.railway.app/` - Should show landing page
- `https://your-domain.railway.app/api/health` - Should return `{"status":"healthy"}`

## Troubleshooting

**Site doesn't load:**
- Check Deployments → Logs for errors
- Verify Public Networking is ON
- Try accessing from different network/VPN

**Database errors:**
- Ensure PostgreSQL addon is connected
- Check that DATABASE_URL is visible in Variables tab
