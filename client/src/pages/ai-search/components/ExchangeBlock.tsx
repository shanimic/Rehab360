import { useState } from 'react'
import AiSummaryCard from './AiSummaryCard'
import FilterBar from './FilterBar'
import SourceCard from './SourceCard'
import type { FilterKey } from './FilterBar'
import type { AiExchange, SavedContent, ApiRole } from '@/types'

interface ExchangeBlockProps {
  exchange: AiExchange
  isLast: boolean
  userRole: ApiRole
  onSave: (item: SavedContent) => void
  onVerify: (recommendationId: string, role: 'PHYSIOTHERAPIST' | 'FITNESS_TRAINER') => void
  savedIds: Set<string>
}

function applyFilter(sources: SavedContent[], filter: FilterKey): SavedContent[] {
  if (filter === 'verified') return sources.filter((s) => s.verified_by_physio || s.verified_by_trainer)
  if (filter === 'unverified') return sources.filter((s) => !s.verified_by_physio && !s.verified_by_trainer)
  return sources
}

export default function ExchangeBlock({
  exchange,
  isLast,
  userRole,
  onSave,
  onVerify,
  savedIds,
}: ExchangeBlockProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const filtered = applyFilter(exchange.sources, filter)

  return (
    <div className="flex flex-col gap-4">
      <AiSummaryCard exchange={exchange} defaultCollapsed={!isLast} />

      <FilterBar filter={filter} onChange={setFilter} count={filtered.length} />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Sources
        </h2>
        {filtered.map((source) => (
          <SourceCard
            key={source.recommendation_id}
            source={source}
            userRole={userRole}
            mode="results"
            onSave={onSave}
            onVerify={onVerify}
            savedIds={savedIds}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center">
            No sources match this filter.
          </p>
        )}
      </div>
    </div>
  )
}
