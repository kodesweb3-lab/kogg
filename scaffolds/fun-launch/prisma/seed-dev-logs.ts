import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

async function main() {
  console.log('🌱 Seeding dev logs...');

  // Clear existing dev logs (optional - comment out if you want to keep existing)
  // await prisma.devLog.deleteMany({});

  const devLogs = [
    // UPDATE Category - Completed Features
    {
      title: 'Obsidian + Aureate Design System with Global Wolf Theming',
      content: `We've completely transformed Kogaion's visual identity with a premium Obsidian + Aureate design system.

**Key Features:**
- Design tokens system with CSS variables for consistent theming
- Global Wolf Theming with 5 pack themes (Fire, Frost, Blood, Moon, Stone)
- Glass-morphic cards with rim-light effects
- Sigil icon system for status badges and ranks
- Consistent motion system with Framer Motion
- Fluid typography with clamp() for responsive scaling
- Premium visual enhancements (noise textures, vignette effects)

**Components Added:**
- WolfThemeProvider for global theme management
- WolfThemeSelector component in header
- Sigil icons (Newborn, Bonded, Ascended, Alpha, Sentinel, Elder)
- Page transitions with AnimatePresence
- Signature ritual moments (WalletConnectionRitual, TokenLaunchSigil)
- Microcopy system with wolf-adaptive messages

The entire platform now has a cohesive, luxury museum aesthetic that elevates the brand from "nice site" to "iconic platform".`,
      category: 'UPDATE' as const,
      status: 'COMPLETED' as const,
      version: 'v1.0.0',
      publishedAt: new Date('2026-01-15'),
    },
    {
      title: 'Service Providers Marketplace Launch',
      content: `We've launched a comprehensive marketplace for service providers in the Solana memetoken ecosystem.

**Features:**
- Registration for KOLs, marketers, moderators, and other service providers
- Twitter verification with automated marketing tweet
- Service tags system with custom tag support
- Detailed provider profiles with contact information
- Premium table layout for better information display
- Telegram, email, and wallet integration

**How it works:**
1. Providers register with their details (Telegram, email, Solana wallet, Twitter)
2. They select their service tags (multiple selection + custom tags)
3. Twitter verification requires posting a marketing tweet
4. Once verified, they appear in the marketplace

This creates a valuable network effect, connecting token creators with service providers while helping with platform marketing.`,
      category: 'UPDATE' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-10'),
    },
    {
      title: 'Real World Assets (RWA) Tokenization',
      content: `We've expanded beyond memecoins to support Real World Assets tokenization.

**Features:**
- Dedicated RWA token type in launch form
- Asset type classification (Product, Service, Property, etc.)
- Asset description and valuation fields
- Document upload support via IPFS
- Asset location tracking
- RWA-specific badges and display in token cards

**Use Cases:**
- Tokenize physical products
- Tokenize services or subscriptions
- Tokenize real estate or property
- Tokenize intellectual property
- Tokenize any real-world asset

This positions Kogaion as more than just a memecoin launchpad - we're building a comprehensive tokenization platform. Combined with our marketplace and AI bots, this creates a complete ecosystem for any type of tokenized asset.`,
      category: 'UPDATE' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-08'),
    },
    {
      title: 'Dev Log Page with Category Filtering',
      content: `We've implemented a comprehensive dev log page to keep the community informed about our progress.

**Features:**
- Category filtering (UPDATE, FIX, ANNOUNCEMENT, ROADMAP, TECHNICAL)
- Status filtering (COMPLETED, IN_PROGRESS, PLANNED, BLOCKED)
- Summary statistics dashboard
- Beautiful card-based entry display
- Version tagging support
- Public/private entry control

**Categories:**
- UPDATE: New features and improvements
- FIX: Bug fixes and patches
- ANNOUNCEMENT: Important platform announcements
- ROADMAP: Future plans and direction
- TECHNICAL: Technical deep-dives (non-sensitive)

This page serves as both a marketing tool and a transparency mechanism, showing what we've built, what we're working on, and where we're heading.`,
      category: 'UPDATE' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-05'),
    },
    // FIX Category
    {
      title: 'Dev Log Database Seeding',
      content: `Fixed the empty dev log state by implementing a comprehensive seed script.

**What was fixed:**
- Dev log page was showing "No entries found" because database was empty
- Created seed script to populate initial dev log entries
- Entries now cover all categories and statuses
- Proper timeline with publishedAt dates

**Technical details:**
- Seed script uses Prisma Client
- Entries are properly categorized and tagged
- All entries are public by default
- Version tags included where relevant

The dev log is now fully functional and populated with comprehensive project documentation.`,
      category: 'FIX' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-20'),
    },
    // ANNOUNCEMENT Category
    {
      title: 'Kogaion Launchpad is Live',
      content: `We're excited to announce that Kogaion is now live on Solana mainnet!

**What is Kogaion?**
Kogaion is the most comprehensive token launchpad on Solana, offering:
- Dynamic Bonding Curve token launches via Meteora
- Real World Assets tokenization
- Service provider marketplace
- Custom AI bot personalities
- Higher developer fees than competitors

**Why Kogaion?**
- We give developers more: higher fees, better tools, complete ecosystem
- Built on audited Meteora smart contracts
- All liquidity locked via Dynamic Bonding Curve
- No rug pulls, no exit scams
- Professional UI/UX with premium design system

**Join the Pack:**
- Website: https://kogaion.fun
- Twitter: https://x.com/KogaionSol
- Telegram: https://t.me/kogaionpack

The future of Solana launchpads is being built here.`,
      category: 'ANNOUNCEMENT' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-01'),
    },
    // ROADMAP Category
    {
      title: 'Genesis SDK Anti-Rug Integration',
      content: `We're planning to integrate Metaplex Genesis SDK for enhanced security and anti-rug protection.

**What is Genesis SDK?**
Genesis SDK provides standardized tokenomics, enhanced security features, and anti-rug mechanisms for Solana tokens.

**Planned Features:**
- Standardized tokenomics templates
- Enhanced security checks
- Anti-rug mechanisms
- Better token verification
- Improved holder confidence

**Timeline:**
- Research and planning: Q1 2026
- Integration development: Q2 2026
- Testing and deployment: Q2 2026

This will make Kogaion one of the most secure launchpads on Solana, giving creators and holders additional confidence in token launches.`,
      category: 'ROADMAP' as const,
      status: 'PLANNED' as const,
      version: null,
      publishedAt: new Date('2026-01-18'),
    },
    {
      title: 'Enhanced AI Bot Capabilities',
      content: `We're planning significant enhancements to our AI bot system.

**Planned Features:**
- Multi-agent swarms for coordinated bot networks
- Advanced analytics and insights
- Predictive market analysis
- Automated community management
- Cross-platform bot deployment

**Technical Improvements:**
- Better model fine-tuning
- Improved context management
- Enhanced personality system
- Real-time learning capabilities
- Integration with more platforms

**Timeline:**
- Planning: Q1 2026
- Development: Q2-Q3 2026
- Beta testing: Q3 2026
- Full release: Q4 2026

These enhancements will make our AI bots more powerful and useful for token creators, while maintaining the 100% user-owned personality system.`,
      category: 'ROADMAP' as const,
      status: 'PLANNED' as const,
      version: null,
      publishedAt: new Date('2026-01-16'),
    },
    {
      title: 'Mobile Application Development',
      content: `We're planning native mobile applications for iOS and Android.

**Planned Features:**
- Full token launch functionality
- Trading terminal
- Portfolio management
- Push notifications
- Biometric authentication
- Offline mode for viewing

**Benefits:**
- Access to launchpad on the go
- Real-time trading alerts
- Better user experience
- Increased accessibility
- Native performance

**Timeline:**
- Design and planning: Q2 2026
- iOS development: Q3 2026
- Android development: Q3-Q4 2026
- Beta testing: Q4 2026
- Public release: Q1 2027

Mobile apps will make Kogaion accessible to a wider audience and provide a better experience for mobile-first users.`,
      category: 'ROADMAP' as const,
      status: 'PLANNED' as const,
      version: null,
      publishedAt: new Date('2026-01-14'),
    },
    // TECHNICAL Category
    {
      title: 'Design Tokens System Architecture',
      content: `Technical deep-dive into our design tokens architecture.

**Architecture Overview:**
We've implemented a comprehensive design token system using CSS variables and semantic tokens.

**File Structure:**
- \`src/styles/design-tokens.css\`: Core design tokens (Obsidian, Aureate, Glass)
- \`src/styles/wolf-themes.css\`: Wolf theme variables (Fire, Frost, Blood, Moon, Stone)
- \`tailwind.config.js\`: Tailwind integration with token colors

**Token Categories:**
1. **Obsidian Base**: Background colors (#0a0a0a, #0f0f0f, #141414)
2. **Aureate Accents**: Desaturated gold (#b8a082, #d4c4a8, #8b7355)
3. **Glass Morphism**: Transparent backgrounds with blur
4. **Wolf Themes**: Dynamic accent colors per pack theme

**Implementation:**
- CSS variables for runtime theming
- Data attributes for theme switching (\`data-wolf-theme\`)
- Tailwind config integration for utility classes
- Semantic tokens for maintainability

**Benefits:**
- Consistent theming across entire platform
- Easy theme switching
- Maintainable color system
- Type-safe with TypeScript

This architecture allows for easy theme customization and ensures visual consistency across all components.`,
      category: 'TECHNICAL' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-12'),
    },
    {
      title: 'Framer Motion System with Page Transitions',
      content: `Technical overview of our motion system implementation.

**System Architecture:**
We've built a consistent animation system using Framer Motion with reusable variants.

**Components:**
- \`src/lib/motion/variants.ts\`: Centralized motion variants
- \`src/components/motion/PageTransition.tsx\`: Page transition wrapper
- \`src/pages/_app.tsx\`: AnimatePresence integration

**Variant Types:**
1. **Hover Variants**: hoverLift, hoverGlow, hoverScale
2. **Page Transitions**: pageInitial, pageAnimate, pageExit
3. **Signature Moments**: sigilReveal (for special animations)
4. **Fade Variants**: fadeIn, fadeInUp
5. **Stagger Containers**: For animating lists

**Key Features:**
- Consistent timing (0.2s-0.7s durations)
- Ease functions (easeOut, easeIn)
- GPU-accelerated transforms
- Reduced motion support ready

**Usage:**
\`\`\`tsx
<motion.div variants={motionVariants.hoverLift}>
  Content
</motion.div>
\`\`\`

**Performance:**
- All animations use transform and opacity (GPU-accelerated)
- No layout shifts
- Smooth 60fps animations
- Respects user motion preferences

This system ensures consistent, performant animations throughout the platform while maintaining code reusability.`,
      category: 'TECHNICAL' as const,
      status: 'COMPLETED' as const,
      version: null,
      publishedAt: new Date('2026-01-11'),
    },
  ];

  for (const entry of devLogs) {
    await prisma.devLog.create({
      data: entry,
    });
    console.log(`✅ Created: ${entry.title}`);
  }

  console.log(`\n🎉 Seeded ${devLogs.length} dev log entries!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dev logs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
