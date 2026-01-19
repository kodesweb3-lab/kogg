# Railway Deployment - Kogaion

## Quick Deploy (3 Steps)

### 1. Deploy from GitHub
1. Go to [railway.app](https://railway.app) → "New Project" → "Deploy from GitHub repo"
2. Select `kodesweb3-lab/kogg`
3. Railway auto-detects Dockerfile and builds

### 2. Add PostgreSQL
1. Click "New" → "Database" → "PostgreSQL"
2. `DATABASE_URL` is set automatically

### 3. Set Environment Variables
Service → Variables:
```
PINATA_JWT=your_jwt
RPC_URL=https://mainnet.helius-rpc.com/?api-key=KEY
ENCRYPTION_KEY=64_char_hex
HUGGINGFACE_API_KEY=hf_key
```

### 4. Generate Domain & Migrate
1. Settings → Networking → "Generate Domain"
2. After deploy, open Shell: `cd scaffolds/fun-launch && pnpm db:migrate`

---

## That's it!
The app will be live at your Railway domain.
