'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  description?: string;
  /** Optional back link (e.g. { href: '/dashboard', label: 'Dashboard' }) */
  back?: { href: string; label: string };
  /** Right-side actions (buttons, etc.) */
  actions?: React.ReactNode;
  className?: string;
}

export function PageTitle({ title, description, back, actions, className }: PageTitleProps) {
  return (
    <div className={cn('mb-8', className)}>
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-3"
        >
          <span>←</span>
          <span>{back.label}</span>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[var(--text-muted)] mt-1 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
