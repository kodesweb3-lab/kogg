# 🚂 Configurare Railway - Kogaion

## Serviciul Web (Next.js)

### Settings în Railway Dashboard:

**Source:**
- ✅ Repo: `kodesweb3-lab/kogg`
- ✅ Branch: `main`
- ✅ Root Directory: **LASĂ GOL** (deploy din root-ul repo-ului)

**Build:**
- Builder: **Railpack** (Default) sau **NIXPACKS**
- Build Command: 
  ```bash
  pnpm install && pnpm build
  ```
- Watch Paths: (opțional) `/src/**`, `/prisma/**`

**Deploy:**
- Start Command:
  ```bash
  pnpm start
  ```
- Healthcheck Path:
  ```
  /api/health
  ```
- Restart Policy: **On Failure** (Max retries: 10)

**Networking:**
- ✅ Public Networking (pentru a fi accesibil public)
- Generate Domain: (Railway va genera automat un domain)

---

## Serviciul Worker (Telegram Bots)

### Settings în Railway Dashboard:

**Source:**
- ✅ Repo: `kodesweb3-lab/kogg` (același repo)
- ✅ Branch: `main`
- ✅ Root Directory: **`apps/worker-bots`** (IMPORTANT!)

**Build:**
- Builder: **NIXPACKS** (recomandat pentru Node.js apps)
- Build Command:
  ```bash
  cd ../.. && pnpm install && cd apps/worker-bots && pnpm build
  ```
  SAU (dacă Railway rulează din root-ul repo-ului):
  ```bash
  pnpm install --filter @kogaion/worker-bots && cd apps/worker-bots && pnpm build
  ```
  SAU (cea mai simplă - Railway rulează din `apps/worker-bots`):
  ```bash
  cd ../.. && pnpm install && cd apps/worker-bots && pnpm build
  ```

**Deploy:**
- Start Command:
  ```bash
  pnpm start
  ```
- Healthcheck Path:
  ```
  /health
  ```
- Restart Policy: **On Failure** (Max retries: 10)

**Networking:**
- ✅ Private Networking (worker-ul nu trebuie să fie public)
- SAU Public Networking dacă vrei să accesezi `/health` din exterior

---

## Variabile de Mediu

### Pentru Web Service:

```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-key
POOL_CONFIG_KEY=GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL
ENCRYPTION_KEY=your_32_byte_hex_key
HUGGINGFACE_API_KEY=your_hf_key
NODE_ENV=production
```

**IMPORTANT**: `DATABASE_URL` se setează automat când adaugi PostgreSQL ca "Resource" la serviciu.

### Pentru Worker Service:

**ACEAȘI VARIABILE** ca la web, **CRITICAL**:
- `DATABASE_URL` - **ACELAȘI** ca la web
- `ENCRYPTION_KEY` - **TREBUIE IDENTIC** cu cel de la web
- `HUGGINGFACE_API_KEY` - același

---

## Build Commands Complete

### Web Service Build Command:
```bash
pnpm install && pnpm build
```

### Worker Service Build Command:
```bash
cd ../.. && pnpm install && cd apps/worker-bots && pnpm build
```

**Explicație Worker Build:**
1. `cd ../..` - merge la root-ul repo-ului (din `apps/worker-bots`)
2. `pnpm install` - instalează toate dependențele (inclusiv root și worker)
3. `cd apps/worker-bots` - revine în folder-ul worker
4. `pnpm build` - compilează TypeScript în JavaScript

---

## Start Commands

### Web Service:
```bash
pnpm start
```

### Worker Service:
```bash
pnpm start
```

---

## Healthcheck Paths

### Web Service:
```
/api/health
```

### Worker Service:
```
/health
```

---

## Verificare după Deploy

1. **Web Service Health:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Worker Service Health:**
   ```bash
   curl https://your-worker.railway.app/health
   ```

3. **Test Aplicația:**
   - Deschide URL-ul web service
   - Conectează wallet
   - Creează un token de test
   - Verifică că apare în `/discover`

---

## Troubleshooting

### Build eșuează pentru Worker:
- Verifică că Root Directory este setat corect: `apps/worker-bots`
- Verifică că build command merge la root pentru `pnpm install`
- Verifică logs în Railway Dashboard

### Worker nu pornește:
- Verifică că toate variabilele sunt setate
- Verifică că `ENCRYPTION_KEY` este identic cu cel de la web
- Verifică logs: `railway logs --service <nume-worker>`
