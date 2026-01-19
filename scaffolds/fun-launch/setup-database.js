// Script to setup database: generate Prisma client and run migrations
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database setup...\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Step 1: Generating Prisma Client...');
  execSync('pnpm db:generate', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('✅ Prisma Client generated successfully!\n');

  // Step 2: Run migrations
  console.log('🗄️  Step 2: Running database migrations...');
  execSync('pnpm db:migrate:dev --name init', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('✅ Database migrations completed successfully!\n');

  console.log('🎉 Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Run: pnpm dev (to start development server)');
  console.log('2. Run: pnpm db:studio (to open Prisma Studio)');

} catch (error) {
  console.error('❌ Error during database setup:', error.message);
  process.exit(1);
}
