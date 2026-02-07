'use client';

import { cn } from '@/lib/utils';

type SectionVariant = 'default' | 'narrow' | 'full-bleed' | 'card-grid';

interface LayoutSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Section spacing: default uses --section-gap */
  gap?: 'none' | 'sm' | 'default' | 'lg';
  /** Constrain width: default (content) | narrow (editorial) | full-bleed */
  variant?: SectionVariant;
  /** Optional section title (left-aligned with optional line) */
  title?: React.ReactNode;
  /** Optional description under title */
  description?: React.ReactNode;
}

const gapMap = {
  none: 'gap-0',
  sm: 'gap-[var(--section-gap-sm)]',
  default: 'gap-[var(--section-gap)]',
  lg: 'gap-[calc(var(--section-gap)*1.5)]',
};

export function LayoutSection({
  children,
  className,
  gap = 'default',
  variant = 'default',
  title,
  description,
}: LayoutSectionProps) {
  const maxWidth =
    variant === 'narrow'
      ? 'max-w-[var(--content-narrow)]'
      : variant === 'full-bleed'
        ? 'max-w-none'
        : 'max-w-[var(--content-max-width)]';

  return (
    <section
      className={cn(
        'flex flex-col',
        gapMap[gap],
        className
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 mb-2 font-heading gradient-text">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn('w-full mx-auto', maxWidth)}>
        {children}
      </div>
    </section>
  );
}
