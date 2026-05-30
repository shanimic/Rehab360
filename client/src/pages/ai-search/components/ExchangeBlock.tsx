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
  onVerify: (url: string, queryId: number, currentlyVerified: boolean) => void
  savedMap: Map<string, number>
}

function applyFilter(sources: SourceCardType[], filter: FilterKey): SourceCardType[] {
  if (filter === 'verified') return sources.filter((s) => s.physio_verification_count > 0 || s.trainer_verification_count > 0)
  if (filter === 'unverified') return sources.filter((s) => s.physio_verification_count === 0 && s.trainer_verification_count === 0)
  return [...sources]
}

export default function ExchangeBlock({
  exchange,
  userRole,
  onSave,
  onVerify,
  savedMap,
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
            {filtered.map((source) => {
              const myVerified =
                (userRole === 'PHYSIOTHERAPIST' && source.physio_verification_count > 0) ||
                (userRole === 'FITNESS_TRAINER' && source.trainer_verification_count > 0)

              return (
                <SourceCard
                  key={source.url}
                  title={source.title}
                  url={source.url}
                  description={source.description}
                  contentType={source.content_type}
                  physioVerificationCount={source.physio_verification_count}
                  trainerVerificationCount={source.trainer_verification_count}
                  userRole={userRole}
                  isSaved={savedMap.has(source.url)}
                  isVerifiedByMe={myVerified}
                  onSave={() => onSave({
                    title: source.title,
                    url: source.url,
                    content_text: source.description ?? null,
                    content_type: source.content_type,
                    query_id: exchange.query_id,
                  })}
                  onVerify={() => onVerify(source.url, exchange.query_id, myVerified)}
                />
              )
            })}
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
