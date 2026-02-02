// Script to generate .env file with encryption key
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

// .env content
const envContent = `# ============================================
# Kogaion Environment Variables - LOCAL
# ============================================
# NEVER commit this file to version control
# ============================================

# ============================================
# Pinata IPFS Storage
# ============================================
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxZDhlMWJjOS03ZmI3LTQyZjUtODk3Ny05OWJlZDhlZDg2OWUiLCJlbWFpbCI6ImtvZGVzd2ViM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDBjNWZkY2Y0MGNjY2U0YmRkZmUiLCJzY29wZWRLZXlTZWNyZXQiOiI1OGU0ODI5NmE0ZGE0MGVkYTFmNzg1OTBkYzRkZjFkNzNmYTdhMTAzOWNhMTJiMjdkNzY2NTQ0NTdhMDg5YzcxIiwiZXhwIjoxODAwMzE0MzYyfQ.h-DDTIEcT2ny1NC37Sh2MUj05y65cngBz-pyyGpeQt0

# ============================================
# Solana Configuration
# ============================================
RPC_URL=https://mainnet.helius-rpc.com/?api-key=c5c3877c-bac1-436e-9487-567aa20fdeb2

# DBC Pool Configuration Key
POOL_CONFIG_KEY=BySD2vRKkCPmaH5A5MH3k5quRe8V23yhk9cKKTR5sv5t

# Treasury Wallet (for reference, also hardcoded in bot/confirm.ts)
TREASURY_WALLET=5hDrp6eTjMKrUFx96wqeQHhXNa7zvp3ba1Z9nTY3tBjA

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://postgres:jtQtLfueAROzxcFbfTUxsrIbjlRdHTKj@postgres.railway.internal:5432/railway

# ============================================
# Security & Encryption
# ============================================
# Generated encryption key (64 hex characters = 32 bytes)
# IMPORTANT: Use the SAME key in worker-bots service
ENCRYPTION_KEY=${encryptionKey}

# ============================================
# AI & Bot Configuration
# ============================================
# TODO: Get HuggingFace API key from: https://huggingface.co/settings/tokens
# (Optional - only needed if using bot features)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# ============================================
# Optional: Node Environment
# ============================================
NODE_ENV=development

# ============================================
# Optional: CORS Configuration
# ============================================
# ALLOWED_ORIGIN=*
`;

// Write .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ .env file created successfully!');
console.log(`✅ Generated ENCRYPTION_KEY: ${encryptionKey}`);
console.log('\n📝 Next steps:');
console.log('1. Review the .env file');
console.log('2. Run: pnpm db:migrate:dev (to create database schema)');
console.log('3. Run: pnpm db:generate (to generate Prisma client)');
console.log('4. Run: pnpm dev (to start development server)');
