# ⚡ Railway Quick Setup - Kogaion

## 📋 Configurare Serviciu Web (Next.js)

### În Railway Dashboard → Settings:

**Source:**
- Root Directory: **LASĂ GOL** (sau `.`)
- Branch: `main`

**Build:**
- Builder: **Railpack** sau **NIXPACKS**
- **Build Command:**
  ```bash
  pnpm install && pnpm build
  ```

**Deploy:**
- **Start Command:**
  ```bash
  pnpm start
  ```
- **Healthcheck Path:**
  ```
  /api/health
  ```

---

## 📋 Configurare Serviciu Worker (Telegram Bots)

### În Railway Dashboard → New Service → GitHub Repo:

**Source:**
- Repo: `kodesweb3-lab/kogg` (același)
- **Root Directory:** `apps/worker-bots`
- Branch: `main`

**Build:**
- Builder: **NIXPACKS**
- **Build Command:**
  ```bash
  cd ../.. && pnpm install && cd apps/worker-bots && pnpm build
  ```

**Deploy:**
- **Start Command:**
  ```bash
  pnpm start
  ```
- **Healthcheck Path:**
  ```
  /health
  ```

---

## 🔑 Variabile de Mediu (pentru AMBELE servicii)

Adaugă în tab-ul "Variables":

```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-key
POOL_CONFIG_KEY=GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL
ENCRYPTION_KEY=your_32_byte_hex_key
HUGGINGFACE_API_KEY=your_hf_key
NODE_ENV=production
```

**IMPORTANT:**
- `DATABASE_URL` se setează automat când adaugi PostgreSQL ca "Resource"
- `ENCRYPTION_KEY` trebuie să fie **IDENTIC** în ambele servicii

---

## ✅ Build Commands Complete

### Web Service:
```bash
pnpm install && pnpm build
```

### Worker Service:
```bash
cd ../.. && pnpm install && cd apps/worker-bots && pnpm build
```

---

## 🚀 Start Commands

### Web Service:
```bash
pnpm start
```

### Worker Service:
```bash
pnpm start
```

---

## 🏥 Healthcheck Paths

### Web Service:
```
/api/health
```

### Worker Service:
```
/health
```

---

## 📝 După Deploy

1. Rulează migrațiile (în Railway Dashboard → Shell):
   ```bash
   pnpm db:migrate
   ```

2. Verifică health:
   - Web: `https://your-app.railway.app/api/health`
   - Worker: `https://your-worker.railway.app/health`
