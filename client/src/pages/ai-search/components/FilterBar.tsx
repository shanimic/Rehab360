import { cn } from '@/lib/utils'
import type { SourceCard, SavedContent } from '@/types'

export type FilterKey = 'all' | 'verified' | 'unverified'

type FilterableSource = SourceCard | SavedContent

function isVerified(s: FilterableSource): boolean {
  return 'is_verified' in s
    ? s.is_verified
    : s.verified_by_physio || s.verified_by_trainer
}

interface FilterBarProps {
  filter: FilterKey
  onChange: (f: FilterKey) => void
  sources: FilterableSource[]
}

export default function FilterBar({ filter, onChange, sources }: FilterBarProps) {
  const total = sources.length
  const verified = sources.filter(isVerified).length
  const unverified = total - verified

  const options: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: total },
    { key: 'verified', label: 'Verified', count: verified },
    { key: 'unverified', label: 'Unverified', count: unverified },
  ]

  return (
    <div
      className="flex gap-2 overflow-x-auto flex-nowrap pb-1 sm:pb-0"
      role="group"
      aria-label="Filter results"
    >
      {options.map(({ key, label, count }) => (
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
          {label} ({count})
        </button>
      ))}
    </div>
  )
}
