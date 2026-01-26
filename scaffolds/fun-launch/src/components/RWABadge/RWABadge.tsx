'use client';

interface RWABadgeProps {
  assetType?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const assetTypeLabels: Record<string, string> = {
  physical_product: 'Product',
  service: 'Service',
  real_estate: 'Real Estate',
  financial_asset: 'Financial',
  intellectual_property: 'IP',
  other: 'Asset',
};

const assetTypeIcons: Record<string, string> = {
  physical_product: '📦',
  service: '🔧',
  real_estate: '🏠',
  financial_asset: '💰',
  intellectual_property: '💡',
  other: '📄',
};

export function RWABadge({ assetType, className = '', size = 'md' }: RWABadgeProps) {
  if (!assetType) return null;

  const label = assetTypeLabels[assetType] || 'Asset';
  const icon = assetTypeIcons[assetType] || '📄';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} bg-dacian-steel-copper/20 border border-dacian-steel-copper/40 rounded-full text-dacian-steel-copper font-medium ${className}`}
      title={`Real World Asset: ${label}`}
    >
      <span>{icon}</span>
      <span className="font-body">{label}</span>
    </span>
  );
}

interface RWATypeBadgeProps {
  className?: string;
}

export function RWATypeBadge({ className = '' }: RWATypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-dacian-steel-copper/20 border border-dacian-steel-copper/40 rounded-full text-dacian-steel-copper text-sm font-medium ${className}`}
      title="Real World Asset Token"
    >
      <span>🌍</span>
      <span className="font-body">RWA</span>
    </span>
  );
}
