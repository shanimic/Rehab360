import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import AiSummaryCard from './AiSummaryCard'
import FilterBar from './FilterBar'
import SourceCard from './SourceCard'
import type { FilterKey } from './FilterBar'
import type { SavePayload } from '@/hooks/useSaveContent'
import type { AiExchange, SourceCard as SourceCardType, ApiRole } from '@/types'

interface ExchangeBlockProps {
  exchange: AiExchange
  userRole: ApiRole
  onSave: (payload: SavePayload) => void
  onVerify: (url: string, verified: boolean) => void
  savedIds: Set<string>
}

function applyFilter(sources: SourceCardType[], filter: FilterKey): SourceCardType[] {
  if (filter === 'verified') return sources.filter((s) => s.physio_verification_count > 0 || s.trainer_verification_count > 0)
  if (filter === 'unverified') return sources.filter((s) => s.physio_verification_count === 0 && s.trainer_verification_count === 0)
  return [...sources].sort((a, b) => {
    const aVerified = a.physio_verification_count > 0 || a.trainer_verification_count > 0 ? 1 : 0
    const bVerified = b.physio_verification_count > 0 || b.trainer_verification_count > 0 ? 1 : 0
    return bVerified - aVerified
  })
}

export default function ExchangeBlock({
  exchange,
  userRole,
  onSave,
  onVerify,
  savedIds,
}: ExchangeBlockProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const filtered = applyFilter(exchange.sources, filter)

  return (
    <div className="ais-exchange-wrapper">
      <div className="ais-exchange-avatar" aria-hidden="true">
        <Sparkles size={14} />
      </div>

      <div className="ais-exchange-card">
        <div className="flex flex-col gap-4">
          <AiSummaryCard exchange={exchange} />

          <FilterBar filter={filter} onChange={setFilter} sources={exchange.sources} />

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Sources
            </h2>
            {filtered.map((source) => (
              <SourceCard
                key={source.url}
                source={source}
                userRole={userRole}
                mode="results"
                query_id={exchange.query_id}
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
      </div>
    </div>
  )
}
