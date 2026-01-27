// Sigil Icons for Token Status Badges - Lore-themed

export function NewbornSigil({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2 L8 6 L12 10 L16 6 Z M12 14 L8 18 L12 22 L16 18 Z"
        opacity="0.8"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function BondedSigil({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2 L6 8 L12 14 L18 8 Z M6 16 L12 22 L18 16 L12 10 Z"
        opacity="0.8"
      />
      <path 
        d="M12 8 L12 16" 
        strokeLinecap="round" 
        strokeWidth={2}
        opacity="0.6"
      />
    </svg>
  );
}

export function AscendedSigil({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2 L4 12 L12 22 L20 12 Z"
        opacity="0.8"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4" />
      <path 
        d="M12 6 L12 18 M6 12 L18 12" 
        strokeLinecap="round" 
        strokeWidth={1.5}
        opacity="0.6"
      />
    </svg>
  );
}

// Pack Leader Rank Sigils
export function AlphaSigil({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2 L20 8 L12 14 L4 8 Z M12 14 L20 20 L12 22 L4 20 Z"
      />
      <circle cx="12" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

export function SentinelSigil({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 2 L8 6 L12 10 L16 6 Z M8 14 L12 18 L16 14 L12 10 Z"
      />
      <path d="M12 6 L12 18" strokeLinecap="round" strokeWidth={2} />
    </svg>
  );
}

export function ElderSigil({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8" />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 4 L12 20 M4 12 L20 12"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
