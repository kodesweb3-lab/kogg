# Railway Deployment - Kogaion

## Quick Deploy

### 1. Create Project on Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `kodesweb3-lab/kogg`
5. Railway will auto-detect the Dockerfile and build

### 2. Add PostgreSQL Database
1. In your project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set `DATABASE_URL`

### 3. Set Environment Variables
Go to your web service → Variables → Add:

```
PINATA_JWT=your_pinata_jwt_token
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
POOL_CONFIG_KEY=GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL
ENCRYPTION_KEY=your_64_char_hex_key
HUGGINGFACE_API_KEY=your_hf_key
```

### 4. Generate Domain
1. Go to Settings → Networking
2. Click "Generate Domain"

### 5. Run Database Migrations
After first deploy, open the service shell and run:
```bash
cd scaffolds/fun-launch && pnpm db:migrate
```

---

## Optional: Add Worker Service (for Telegram Bots)

1. In project, click "New" → "GitHub Repo" → same repo
2. Set:
   - **Root Directory**: leave empty
   - **Dockerfile Path**: `Dockerfile.worker`
3. Add SAME environment variables as web service
4. `ENCRYPTION_KEY` MUST be identical to web service

---

## Troubleshooting

### Build fails with Node version error
The Dockerfile uses Node 20.19 which is compatible with all dependencies.

### Database connection fails
Make sure PostgreSQL is added and `DATABASE_URL` is automatically injected.

### Health check fails
The app needs ~30-60 seconds to start. Health check path is `/api/health`.
