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
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-steam-cyber-bgElevated rounded-xl border border-steam-cyber-neon-cyan/20 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
          className="w-full pl-10 pr-4 py-2 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steam-cyber-neon-cyan/50 font-body"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm font-body">Sort:</span>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-3 py-2 bg-steam-cyber-bgHover border border-steam-cyber-neon-cyan/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-steam-cyber-neon-cyan/50 font-body text-sm"
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
