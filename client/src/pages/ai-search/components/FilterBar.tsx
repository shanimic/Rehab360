import { cn } from '@/lib/utils'

export type FilterKey = 'all' | 'verified' | 'unverified'

interface FilterBarProps {
  filter: FilterKey
  onChange: (f: FilterKey) => void
  count: number
}

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: 'unverified', label: 'Unverified' },
]

export default function FilterBar({ filter, onChange, count }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div
        className="flex gap-2 overflow-x-auto flex-nowrap pb-1 sm:pb-0"
        role="group"
        aria-label="Filter results"
      >
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex-shrink-0 text-sm font-medium px-4 py-2.5 rounded-full border transition-colors min-h-[44px] whitespace-nowrap',
              filter === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500 sm:flex-shrink-0">
        {count} {count === 1 ? 'result' : 'results'}
      </span>
    </div>
  )
}
