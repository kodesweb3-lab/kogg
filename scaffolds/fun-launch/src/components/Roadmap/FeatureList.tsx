interface FeatureListProps {
  features: string[];
  className?: string;
}

export function FeatureList({ features, className }: FeatureListProps) {
  return (
    <ul className={`space-y-2 ${className || ''}`}>
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-sm font-body text-[var(--text-muted)]">
          <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
