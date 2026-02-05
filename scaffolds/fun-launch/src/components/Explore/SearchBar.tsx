import { useExplore, SortOption } from '@/contexts/ExploreProvider';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mcap_high', label: 'MCap High' },
  { value: 'mcap_low', label: 'MCap Low' },
];

export function SearchBar() {
  const { 
    searchQuery, 
    setSearchQuery, 
    sortOption, 
    setSortOption,
    tokenTypeFilter,
    setTokenTypeFilter,
    assetTypeFilter,
    setAssetTypeFilter,
  } = useExplore();

  const assetTypes = [
    { value: '', label: 'All Assets' },
    { value: 'physical_product', label: 'Physical Product' },
    { value: 'service', label: 'Service' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'financial_asset', label: 'Financial Asset' },
    { value: 'intellectual_property', label: 'Intellectual Property' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, symbol, or asset description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-body"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)] text-sm font-body whitespace-nowrap">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-body text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl">
        {/* Token Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)] text-sm font-body whitespace-nowrap">Type:</span>
          <select
            value={tokenTypeFilter}
            onChange={(e) => setTokenTypeFilter(e.target.value as 'ALL' | 'MEMECOIN' | 'RWA')}
            className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-body text-sm"
          >
            <option value="ALL">All Tokens</option>
            <option value="MEMECOIN">Memecoins</option>
            <option value="RWA">Real World Assets</option>
          </select>
        </div>

        {/* Asset Type Filter - Only show when RWA is selected */}
        {tokenTypeFilter === 'RWA' && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm font-body whitespace-nowrap">Asset:</span>
            <select
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-body text-sm"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
