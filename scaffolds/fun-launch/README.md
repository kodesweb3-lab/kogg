# Kogaion 🐺

**Summon Tokens. Ascend Markets.**

Kogaion is the Dacian Wolf spirit—guardian of the mountain, guide of the ascent. On Solana, we summon tokens through the ritual of the Dynamic Bonding Curve. Each launch is a climb. Each holder joins the pack. Each graduation to DAMM v2 marks a new peak conquered.

## The Story

In ancient Dacia, the Kogainon mountain stood as a sacred peak—a place where warriors ascended to prove their worth. The wolf, guardian of the mountain, watched over each climb. Those who reached the summit joined the pack.

On Solana, Kogaion is that mountain. The Dynamic Bonding Curve is the path. Each token launch is a ritual—a summoning. Traders who buy become part of the pack. The ascent begins.

- **Mountain = Curve**: The bonding curve is the path. Price moves as traders join.
- **Ascent = Progress**: Market cap grows. Holders accumulate. The token climbs higher.
- **Pack = Holders**: Every trader who buys joins the pack. Together, they push toward graduation.
- **Graduation = DAMM v2**: When conditions are met, the token graduates to permanent liquidity. The summit is reached.

## Architecture

Kogaion consists of three main services:

1. **Web Service** (Next.js): Main application, API routes, UI
2. **Worker Service** (Node.js): Telegram bot worker, loads active bots
3. **Database** (PostgreSQL): Token data, metrics, bot personas

### Key Features

- 🚀 **Token Launch**: Create tokens with Dynamic Bonding Curve
- 🎨 **Personality Builder**: 100% user-owned token bot personalities
- 🐺 **AI Wolves**: Preset personas (Fire, Frost, Blood, Moon, Stone) or build custom
- 💬 **Ask Kogaion**: Platform helper AI (separate from token bots)
- 📊 **Real-time Charts**: Live trading data and metrics
- 🔒 **LP Locked**: All liquidity locked via Meteora DBC
- 🛡️ **Verified Contracts**: Built on audited Meteora smart contracts

## Setup

1. Clone the repository

```bash
git clone https://github.com/MeteoraAg/meteora-invent.git
cd scaffolds/fun-launch
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables Create a `.env` file in the root directory with the following
   variables:

```bash
cp .env.example .env
```

```env
# Pinata IPFS Storage
PINATA_JWT=your_pinata_jwt_token

# Solana RPC URL (required)
# Get from providers like Helius, QuickNode, or Alchemy
RPC_URL=your_rpc_url

# Pool Configuration (DBC config key)
# Default: GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL
# You can override this if you have a custom DBC config
POOL_CONFIG_KEY=GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL

# PostgreSQL Database URL (required)
# Format: postgresql://user:password@host:port/database
# For local development: postgresql://postgres:password@localhost:5432/kogaion
DATABASE_URL=postgresql://user:password@localhost:5432/kogaion
```

### Getting Pinata JWT

1. Go to [Pinata Dashboard](https://app.pinata.cloud)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the dashboard
4. Click "New Key" to create a new API key
5. Configure the key with the following settings:
   - **Key Name**: Give it a descriptive name (e.g., "Kogaion Storage")
   - **Admin**: Enable admin permissions (or configure specific permissions for uploads)
   - **Pin File To IPFS**: Enable
   - **Pin JSON To IPFS**: Enable
6. Click "Create" and copy the **JWT** token (you'll only see it once!)
7. Store the JWT securely in your `.env` file as `PINATA_JWT`

**Important**: Never expose your Pinata JWT in client-side code. It should only be used in server-side API routes.

### Getting RPC URL

The RPC URL is **required** for the application to function. You can get one from:

1. **Helius** - [https://helius.dev](https://helius.dev) (recommended for Solana)
2. **QuickNode** - [https://quicknode.com](https://quicknode.com)
3. **Alchemy** - [https://alchemy.com](https://alchemy.com)
4. **Public RPC** - Free but rate-limited (not recommended for production)

The RPC URL must be a valid Solana RPC endpoint. The application will validate this on startup.

### Pool Config Key (DBC Config)

The `POOL_CONFIG_KEY` is the Dynamic Bonding Curve (DBC) configuration public key. 

- **Default value**: `GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL`
- This is pre-configured and works out of the box
- You only need to change it if you're deploying a custom DBC configuration
- Must be a valid Solana public key (validated on startup)

The application validates that `POOL_CONFIG_KEY` is a valid Solana public key format.

### Setting up PostgreSQL Database

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Create a database**:
   ```bash
   createdb kogaion
   # Or using psql:
   psql -U postgres
   CREATE DATABASE kogaion;
   ```

3. **Set DATABASE_URL** in your `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/kogaion
   ```
   Replace `postgres`, `password`, `localhost`, `5432`, and `kogaion` with your actual database credentials.

4. **Run Prisma migrations**:
   ```bash
   pnpm prisma migrate dev
   ```
   This will create all tables including `Token`, `Metric`, `BotPersona`, and `TelegramBot` in your database.

5. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```
   This generates the Prisma client used by both the main app and worker-bots.

### Database Schema

The application uses the following tables:

- **Token**: Stores token information (mint, name, symbol, imageUrl, metadataUri, dbcPool, creatorWallet, configKey, createdAt)
- **Metric**: Stores token metrics (tokenMint, price, mcap, vol24h, holders, updatedAt)
- **BotPersona**: Stores AI bot persona configuration (tokenMint, systemPrompt, traitsJson, allowed, forbidden, tone)
- **TelegramBot**: Stores encrypted bot tokens and status (tokenMint, encryptedToken, status, createdAt)

### Bot Features (Optional)

Kogaion supports AI-powered Telegram bots for token communities:

1. **Get BotFather Token**:
   - Create a bot with [@BotFather](https://t.me/BotFather) on Telegram
   - Copy the bot token

2. **Set Encryption Key**:
   ```bash
   # Generate a secure key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Add to `.env` as `ENCRYPTION_KEY` (must match in worker-bots)

3. **Get HuggingFace API Key**:
   - Sign up at [HuggingFace](https://huggingface.co)
   - Create API token at [Settings > Tokens](https://huggingface.co/settings/tokens)
   - Add to `.env` as `HUGGINGFACE_API_KEY`

4. **Run Bot Worker**:
   ```bash
   cd apps/worker-bots
   pnpm install
   pnpm dev
   ```

**Note**: Bot activation requires a 0.1 SOL payment to the treasury wallet.

### Bot API Routes

- **POST /api/bot/activate**: Creates a payment transaction for bot activation
  - Body: `{ tokenMint, botToken, systemPrompt, traitsJson, allowed?, forbidden?, tone, userWallet }`
  - Returns: `{ transaction, treasuryWallet, amount }`
  - User must sign and send the transaction, then call `/api/bot/confirm`

- **POST /api/bot/confirm**: Verifies payment and activates bot
  - Body: `{ tokenMint, signature }`
  - Verifies 0.1 SOL payment to treasury wallet
  - Activates bot (status: ACTIVE)
  - Worker will pick up the bot within 30 seconds

4. Run the development server

```bash
pnpm dev
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account

3. Click "New Project"

4. Import your GitHub repository

5. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: .next

6. Add Environment Variables:
   - Add all the environment variables from your `.env` file:
     - `PINATA_JWT` (your Pinata JWT token)
     - `RPC_URL` (your Solana RPC URL - **required**)
     - `POOL_CONFIG_KEY` (DBC config key, defaults to `GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL`)
     - `DATABASE_URL` (PostgreSQL connection string - **required**)
     - `ENCRYPTION_KEY` (for bot token encryption - required if using bots)
     - `HUGGINGFACE_API_KEY` (for AI bot responses - required if using bots)

7. Click "Deploy"

8. Vercel will automatically deploy your site and provide you with a URL

### Environment Variables in Vercel

You can manage your environment variables in Vercel:

1. Go to your project settings
2. Click on "Environment Variables"
3. Add each variable from your `.env` file
4. You can set different values for Production, Preview, and Development environments

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure your DNS settings

## Documentation

- **[Branding Guide](docs/BRANDING.md)**: Complete brand system (colors, fonts, logo usage)
- **[Personality Builder](docs/PERSONALITY_BUILDER.md)**: User-owned persona system guide
- **[Railway Deployment](docs/RAILWAY_DEPLOYMENT.md)**: Step-by-step deployment guide
- **[Security](docs/SECURITY.md)**: Encryption, secrets management
- **[Environment Variables](docs/ENV.md)**: Complete environment variable reference
- **[Pre-Launch Checklist](docs/PRELAUNCH_CHECKLIST.md)**: Production readiness checklist

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Solana Web3.js
- Dynamic Bonding Curve SDK
- Pinata IPFS for decentralized storage (your memes live forever)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
