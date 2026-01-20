import { useExplore, SortOption } from '@/contexts/ExploreProvider';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mcap_high', label: 'MCap High' },
  { value: 'mcap_low', label: 'MCap Low' },
];

export function SearchBar() {
  const { searchQuery, setSearchQuery, sortOption, setSortOption } = useExplore();

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-mystic-steam-ash rounded-xl border border-mystic-steam-copper/30 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mystic-steam-parchment/50"
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
          placeholder="Search by name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-mystic-steam-charcoal border border-mystic-steam-copper/20 rounded-lg text-mystic-steam-parchment placeholder-mystic-steam-parchment/40 focus:outline-none focus:ring-2 focus:ring-mystic-steam-copper/30 font-body"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mystic-steam-parchment/50 hover:text-mystic-steam-parchment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-mystic-steam-parchment/60 text-sm font-body">Sort:</span>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-3 py-2 bg-mystic-steam-charcoal border border-mystic-steam-copper/20 rounded-lg text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-mystic-steam-copper/30 font-body text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
