/**
 * Predefined tags for service providers
 * These are the standard tags that users can select from
 */
export const PREDEFINED_TAGS = [
  // Marketing & Promotion
  'KOL',
  'Influencer',
  'Content Creator',
  'Shiller',
  'Promoter',
  'Marketing Specialist',
  'Social Media Manager',
  'Brand Ambassador',
  'Growth Hacker',
  'PR Specialist',
  'Media Buyer',
  'Paid Ads Manager',
  'SEO Specialist',
  'Email Marketer',
  // Community
  'Moderator',
  'Community Manager',
  'Discord Admin',
  'Telegram Admin',
  'Community Builder',
  'Community Growth',
  'Engagement Manager',
  'Support Specialist',
  'Event Organizer',
  // Technical
  'Developer',
  'Smart Contract Auditor',
  'Technical Writer',
  'Blockchain Developer',
  'Solidity Developer',
  'Rust Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'DevOps Engineer',
  'Security Auditor',
  'QA Tester',
  // Design & Creative
  'Graphic Designer',
  'Video Editor',
  'NFT Artist',
  'UI/UX Designer',
  'Motion Graphics',
  '3D Artist',
  'Illustrator',
  'Brand Designer',
  'Web Designer',
  'Animator',
  'Photographer',
  // Strategy & Consulting
  'Marketing Strategist',
  'Tokenomics Consultant',
  'Advisor',
  'Business Consultant',
  'Launch Strategist',
  'Go-to-Market Specialist',
  'Product Manager',
  'Project Manager',
  // Trading & Market Making
  'Market Maker',
  'Trading Bot Developer',
  'DeFi Analyst',
  'Trading Advisor',
  'Liquidity Provider',
  // Analytics & Research
  'Analyst',
  'Researcher',
  'Data Analyst',
  'On-Chain Analyst',
  'Market Researcher',
  'Competitive Analyst',
  // Content & Writing
  'Copywriter',
  'Technical Writer',
  'Blog Writer',
  'Ghostwriter',
  'Script Writer',
  'Content Strategist',
  'SEO Writer',
  // Social Media
  'Twitter Manager',
  'Instagram Manager',
  'TikTok Creator',
  'YouTube Creator',
  'Streamer',
  'Podcaster',
  // Legal & Compliance
  'Legal Advisor',
  'Compliance Officer',
  'Regulatory Consultant',
  // Other
  'Translator',
  'Voice Actor',
  'Video Producer',
  'Stream Producer',
  'Partnership Manager',
  'Business Development',
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];

/**
 * Check if a tag is predefined
 */
export function isPredefinedTag(tag: string): boolean {
  return PREDEFINED_TAGS.includes(tag as PredefinedTag);
}

/**
 * Get all predefined tags as array
 */
export function getAllPredefinedTags(): string[] {
  return [...PREDEFINED_TAGS];
}
