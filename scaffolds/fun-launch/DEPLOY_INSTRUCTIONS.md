# 🚀 Instrucțiuni Deploy Railway - Kogaion

## Status Actual
✅ Railway CLI instalat  
✅ Proiect linkat: `lucky-art`  
✅ PostgreSQL există în proiect  
⚠️ Servicii multiple detectate - trebuie configurate manual

## Pași pentru Deploy Complet

### 1. Configurează Serviciul Web în Railway Dashboard

**IMPORTANT**: Web service-ul este root-ul repository-ului GitHub (`kodesweb3-lab/kogg`). Repository-ul conține direct conținutul din `fun-launch`, deci NU există folder `scaffolds/fun-launch` în repo!

**Structura Repository:**
```
kodesweb3-lab/kogg (root GitHub)
├── package.json (Next.js app)
├── src/ (Next.js pages și components)
├── apps/
│   └── worker-bots/ (Worker service)
└── prisma/ (Database schema)
```

1. Mergi la: https://railway.com/project/3a9ecd61-b087-470f-941a-cd33701116d4
2. Click "New" → "GitHub Repo"
3. Selectează repository-ul `kodesweb3-lab/kogg`
4. Railway va detecta automat că este un Next.js app
5. Configurează serviciul:
   - **Name**: dă-i orice nume (ex: `kogaion-web`, `web`, `main`)
   - **Root Directory**: lasă GOL (deploy direct din root-ul repo-ului)
   - **Build Command**: `pnpm install && pnpm build` (sau lasă Railway să detecteze automat)
   - **Start Command**: `pnpm start` (sau lasă Railway să detecteze automat)
   - **Healthcheck Path**: `/api/health` (opțional, dar recomandat)

### 2. Setează Variabilele de Mediu (în Railway Dashboard)

Pentru serviciul web, adaugă în tab-ul "Variables":

```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-key
POOL_CONFIG_KEY=GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL
ENCRYPTION_KEY=your_32_byte_hex_key
HUGGINGFACE_API_KEY=your_hf_key
NODE_ENV=production
```

**Important**: `DATABASE_URL` se setează automat când adaugi PostgreSQL ca "Resource" la serviciu.

### 3. Rulează Migrațiile (după ce serviciul este configurat)

În Railway Dashboard:
1. Click pe serviciul web
2. Mergi la "Deployments"
3. Click pe ultimul deployment
4. Click pe "Shell" sau "Logs"
5. Rulează: `pnpm db:migrate`

SAU folosește Railway CLI (după ce serviciul este configurat):
```bash
railway service <nume-serviciu-web>
railway run pnpm db:migrate
```

### 4. Deploy Serviciul Web

Railway va face deploy automat când:
- Push pe GitHub (dacă ai conectat repo-ul)
- Sau manual: `railway up --service <nume-serviciu-web>`

### 5. Creează Serviciul Worker

**IMPORTANT**: Worker service-ul este în folder-ul `apps/worker-bots` (acesta există deja în repository!)

1. În Railway Dashboard, click "New" → "GitHub Repo"
2. Selectează același repository (`kodesweb3-lab/kogg`)
3. Configurează serviciul:
   - **Name**: `kogaion-worker-bots` (sau orice nume)
   - **Root Directory**: `apps/worker-bots` (IMPORTANT: calea din root-ul repo-ului, fără `scaffolds/fun-launch`!)
   - **Build Command**: `cd ../.. && pnpm install && cd apps/worker-bots && pnpm build`
   - **Start Command**: `pnpm start`
   - **Healthcheck Path**: `/health` (opțional)

### 6. Setează Variabilele pentru Worker

Aceleași variabile ca pentru web, **IMPORTANT**:
- `DATABASE_URL` - același ca la web
- `ENCRYPTION_KEY` - **TREBUIE să fie identic** cu cel de la web
- `HUGGINGFACE_API_KEY` - același

### 7. Deploy Worker

Railway va face deploy automat sau manual:
```bash
railway service kogaion-worker-bots
railway up
```

## Verificare

### Health Checks

**Web Service:**
```bash
curl https://your-app.railway.app/api/health
```

**Worker Service:**
```bash
curl https://your-worker.railway.app/health
```

### Test Aplicația

1. Deschide URL-ul web service
2. Conectează wallet
3. Creează un token de test
4. Verifică că apare în `/discover`

## Comenzi CLI Utile

```bash
# Verifică status
railway status

# Vezi servicii
railway service

# Vezi variabile
railway variables

# Vezi logs
railway logs

# Deschide dashboard
railway open
```

## Troubleshooting

### Migrațiile nu rulează
- Verifică că `DATABASE_URL` este setat corect
- Rulează migrațiile în contextul Railway (nu local)

### Build eșuează
- Verifică logs în Railway Dashboard
- Asigură-te că toate dependențele sunt în `package.json`

### Worker nu pornește
- Verifică că toate variabilele sunt setate
- Verifică că `ENCRYPTION_KEY` este identic cu cel de la web
- Verifică logs: `railway logs --service kogaion-worker-bots`
