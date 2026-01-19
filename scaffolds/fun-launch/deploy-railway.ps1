# Railway Deployment Script for Kogaion
# Run this script to deploy Kogaion to Railway

Write-Host "🚀 Kogaion Railway Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Railway CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
}

# Login to Railway
Write-Host ""
Write-Host "🔐 Logging in to Railway..." -ForegroundColor Yellow
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to Railway" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged in to Railway" -ForegroundColor Green

# Link to existing project or create new
Write-Host ""
Write-Host "🔗 Linking to Railway project..." -ForegroundColor Yellow
Write-Host "If you already have a project, select it. Otherwise, create a new one." -ForegroundColor Gray
railway link
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project linked" -ForegroundColor Green

# Add PostgreSQL if not exists
Write-Host ""
Write-Host "🗄️  Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PostgreSQL might already exist, continuing..." -ForegroundColor Yellow
} else {
    Write-Host "✅ PostgreSQL added" -ForegroundColor Green
}

# Set environment variables
Write-Host ""
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Yellow
Write-Host "Please make sure you have the following values ready:" -ForegroundColor Gray
Write-Host "  - PINATA_JWT" -ForegroundColor Gray
Write-Host "  - RPC_URL" -ForegroundColor Gray
Write-Host "  - HUGGINGFACE_API_KEY" -ForegroundColor Gray
Write-Host "  - ENCRYPTION_KEY (generate with: pnpm generate:encryption-key)" -ForegroundColor Gray
Write-Host ""

$pinataJwt = Read-Host "Enter PINATA_JWT"
$rpcUrl = Read-Host "Enter RPC_URL"
$hfKey = Read-Host "Enter HUGGINGFACE_API_KEY"
$encryptionKey = Read-Host "Enter ENCRYPTION_KEY (or press Enter to generate)"

if ([string]::IsNullOrWhiteSpace($encryptionKey)) {
    Write-Host "Generating encryption key..." -ForegroundColor Yellow
    $encryptionKey = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    Write-Host "Generated key: $encryptionKey" -ForegroundColor Green
    Write-Host "⚠️  SAVE THIS KEY - you'll need it for the worker service!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting variables..." -ForegroundColor Yellow

railway variables set PINATA_JWT="$pinataJwt"
railway variables set RPC_URL="$rpcUrl"
railway variables set POOL_CONFIG_KEY="GvoZ6trCqQhNWiDnS5x27XE5tTyKhGepn4dcqg9bLpmL"
railway variables set ENCRYPTION_KEY="$encryptionKey"
railway variables set HUGGINGFACE_API_KEY="$hfKey"
railway variables set NODE_ENV="production"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Run database migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
railway run pnpm db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migrations completed" -ForegroundColor Green

# Deploy web service
Write-Host ""
Write-Host "🚀 Deploying web service..." -ForegroundColor Yellow
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web service deployed" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create worker service: railway service create kogaion-worker-bots" -ForegroundColor Gray
Write-Host "2. Set worker root directory: apps/worker-bots" -ForegroundColor Gray
Write-Host "3. Set same environment variables for worker service" -ForegroundColor Gray
Write-Host "4. Deploy worker: railway up --service kogaion-worker-bots" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 View your deployment: railway open" -ForegroundColor Cyan
