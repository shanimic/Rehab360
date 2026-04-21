import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { CheckCircle, Trash2, Bookmark } from 'lucide-react'
import { authAtom } from '@/store/authAtom'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useUnsaveContent } from '@/hooks/useUnsaveContent'
import PatientTopNav from '@/components/PatientTopNav'
import type { SavedContent } from '@/types'
import { cn } from '@/lib/utils'
import { mockQueryHistory } from '@/mocks/aiSearchMocks'
import './SavedContentPage.css'

type VerifyFilter = 'all' | 'verified' | 'unverified'
type SortOption = 'recent' | 'relevant'

function verificationBadge(verifiedBy: string[]) {
  const hasPhysio = verifiedBy.includes('THERAPIST')
  const hasTrainer = verifiedBy.includes('TRAINER')
  if (hasPhysio && hasTrainer) return { label: 'Verified by Physio & Trainer', className: 'saved-card__verify-badge--both' }
  if (hasPhysio) return { label: 'Verified by Physio', className: 'saved-card__verify-badge--physio' }
  if (hasTrainer) return { label: 'Verified by Trainer', className: 'saved-card__verify-badge--trainer' }
  return null
}

function queryLabel(queryId: string): string {
  const q = mockQueryHistory.find((h) => h.query_id === queryId)
  return q ? q.query_content : 'Unknown query'
}

function applyVerifyFilter(items: SavedContent[], filter: VerifyFilter): SavedContent[] {
  if (filter === 'verified') return items.filter((i) => i.verifiedBy.length > 0)
  if (filter === 'unverified') return items.filter((i) => i.verifiedBy.length === 0)
  return items
}

function applySortOption(items: SavedContent[], sort: SortOption): SavedContent[] {
  if (sort === 'recent') {
    return [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }
  // 'relevant' sorts by verification breadth
  return [...items].sort((a, b) => b.verifiedBy.length - a.verifiedBy.length)
}

export default function SavedContentPage() {
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)
  const initialContent = useSavedContent()
  const [localContent, setLocalContent] = useState<SavedContent[]>(initialContent)
  const [verifyFilter, setVerifyFilter] = useState<VerifyFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')

  const unsave = useUnsaveContent((id) => {
    setLocalContent((prev) => prev.filter((i) => i.recommendation_id !== id))
  })

  const filtered = applyVerifyFilter(localContent, verifyFilter)
  const sorted = applySortOption(filtered, sortOption)

  return (
    <div className="ais-saved pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-saved__main">
        {/* Filter + sort bar */}
        <div className="ais-saved__controls">
          <div className="ais-saved__filter-group" role="group" aria-label="Filter by verification">
            {(['all', 'verified', 'unverified'] as VerifyFilter[]).map((f) => (
              <button
                key={f}
                className={cn('ais-saved__chip', verifyFilter === f && 'ais-saved__chip--active')}
                onClick={() => setVerifyFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : 'Unverified'}
              </button>
            ))}
          </div>

          <div className="ais-saved__sort-group" role="group" aria-label="Sort order">
            {(['recent', 'relevant'] as SortOption[]).map((s) => (
              <button
                key={s}
                className={cn('ais-saved__chip ais-saved__chip--sort', sortOption === s && 'ais-saved__chip--active')}
                onClick={() => setSortOption(s)}
              >
                {s === 'recent' ? 'Most Recent' : 'Most Relevant'}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="ais-saved__empty">
            <div className="ais-saved__empty-icon" aria-hidden="true">
              <Bookmark size={40} />
            </div>
            <p className="ais-saved__empty-title">No saved content yet</p>
            <p className="ais-saved__empty-sub">
              Save articles and guides from your search results to find them here.
            </p>
            <button
              className="ais-saved__empty-cta"
              onClick={() => navigate('/ai-search')}
            >
              Search Now
            </button>
          </div>
        )}

        {/* Content list */}
        {sorted.length > 0 && (
          <ul className="ais-saved__list">
            {sorted.map((item) => {
              const badge = verificationBadge(item.verifiedBy)
              return (
                <li key={item.recommendation_id} className="saved-card">
                  <div className="saved-card__top-row">
                    <span className="saved-card__type-badge">{item.content_type}</span>
                    {badge && (
                      <span className={cn('saved-card__verify-badge', badge.className)}>
                        <CheckCircle size={11} />
                        {badge.label}
                      </span>
                    )}
                  </div>

                  <h3 className="saved-card__title">{item.content_title}</h3>
                  <p className="saved-card__desc">{item.content_text}</p>

                  <p className="saved-card__origin">
                    Saved from: {queryLabel(item.query_id)}
                  </p>

                  <div className="saved-card__actions">
                    <button className="saved-card__btn saved-card__btn--primary">Read More</button>
                    <button
                      className="saved-card__btn saved-card__btn--delete"
                      aria-label="Remove from saved"
                      onClick={() => unsave.mutate(item.recommendation_id)}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
