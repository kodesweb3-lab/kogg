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
  // Community
  'Moderator',
  'Community Manager',
  'Discord Admin',
  'Telegram Admin',
  'Community Builder',
  // Technical
  'Developer',
  'Smart Contract Auditor',
  'Technical Writer',
  'Blockchain Developer',
  // Design & Creative
  'Graphic Designer',
  'Video Editor',
  'NFT Artist',
  'UI/UX Designer',
  // Strategy & Consulting
  'Marketing Strategist',
  'Tokenomics Consultant',
  'Advisor',
  'Business Consultant',
  // Other
  'Translator',
  'Copywriter',
  'Analyst',
  'Researcher',
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
