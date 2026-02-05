import { RoadmapCard, RoadmapPhase } from './RoadmapCard';
import { TimelineConnector } from './TimelineConnector';
import { EarlyAdopterBenefits } from './EarlyAdopterBenefits';

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    description: 'Core platform infrastructure and basic features',
    status: 'active',
    features: [
      'Token launch platform',
      'Basic trading (buy/sell)',
      'Token discovery',
      'Leaderboard',
      'Referral system',
    ],
    icon: (
      <svg className="w-8 h-8 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    glowColor: 'rgba(184,115,51,0.15)',
    index: 0,
  },
  {
    id: 'gamification',
    title: 'Gamification System',
    description: 'Pack levels, rewards, and creator incentives',
    status: 'planned',
    features: [
      'Pack Levels & Creator Tiers',
      'Ritual Points system',
      'Achievement badges (NFT)',
      'Revenue sharing program',
      'Staking for creators',
    ],
    icon: (
      <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    glowColor: 'rgba(140,90,43,0.15)',
    index: 1,
  },
  {
    id: 'games-contests',
    title: 'Games & Contests',
    description: 'Trading competitions and community challenges',
    status: 'planned',
    features: [
      'Trading competitions',
      'Token launch challenges',
      'Monthly quests',
      'Prize pools (SOL rewards)',
      'NFT rewards for winners',
    ],
    icon: (
      <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.12.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ),
    glowColor: 'rgba(140,90,43,0.15)',
    index: 2,
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    description: 'Cross-chain, analytics, and enterprise solutions',
    status: 'vision',
    features: [
      'Cross-chain support',
      'Advanced analytics',
      'White-label solutions',
      'API for developers',
      'Mobile app',
    ],
    icon: (
      <svg className="w-8 h-8 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.81 14.12L5.64 11.3l8.49 8.49-2.83 2.83L2.81 14.12zm14.78-1.81L15.36 9.3l-1.41 1.41 2.12 2.12-2.83 2.83-2.12-2.12-1.41 1.41 2.12 2.12-2.83 2.83-2.12-2.12-1.41 1.41 2.12 2.12-2.83 2.83-2.12-2.12-1.41 1.41 2.12 2.12L2.81 14.12l2.83-2.83 2.12 2.12 1.41-1.41-2.12-2.12 2.83-2.83 2.12 2.12 1.41-1.41-2.12-2.12 2.83-2.83 2.12 2.12 1.41-1.41-2.12-2.12 2.83-2.83 2.12 2.12 1.41-1.41-2.12-2.12L21.19 9.88l-2.83 2.83-2.12-2.12-1.41 1.41z" />
      </svg>
    ),
    glowColor: 'rgba(111,78,55,0.15)',
    index: 3,
  },
];

export function Roadmap() {
  return (
    <div className="w-full">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        {roadmapPhases.map((phase, index) => (
          <div key={phase.id} className="w-full max-w-2xl">
            <RoadmapCard phase={phase} />
            {index < roadmapPhases.length - 1 && (
              <TimelineConnector isActive={phase.status === 'active'} />
            )}
          </div>
        ))}
      </div>

      {/* Early Adopter Benefits */}
      <div className="mt-12">
        <EarlyAdopterBenefits />
      </div>
    </div>
  );
}
