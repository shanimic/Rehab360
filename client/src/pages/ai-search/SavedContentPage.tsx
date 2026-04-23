import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useUnsaveContent } from '@/hooks/useUnsaveContent'
import PatientTopNav from '@/components/PatientTopNav'
import FilterBar from './components/FilterBar'
import SourceCard from './components/SourceCard'
import type { FilterKey } from './components/FilterBar'
import type { SavedContent } from '@/types'
import { mockQueryHistory } from '@/mocks/aiSearchMocks'
import './SavedContentPage.css'

type SortOption = 'recent' | 'trusted'

function queryLabel(queryId: string): string {
  return mockQueryHistory.find((h) => h.query_id === queryId)?.query_content ?? 'Unknown query'
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function applyFilter(items: SavedContent[], filter: FilterKey): SavedContent[] {
  if (filter === 'verified') return items.filter((i) => i.verified_by_physio || i.verified_by_trainer)
  if (filter === 'unverified') return items.filter((i) => !i.verified_by_physio && !i.verified_by_trainer)
  return items
}

function applySort(items: SavedContent[], sort: SortOption): SavedContent[] {
  if (sort === 'recent') {
    return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return [...items].sort((a, b) => {
    const bScore = (b.verified_by_physio ? 1 : 0) + (b.verified_by_trainer ? 1 : 0)
    const aScore = (a.verified_by_physio ? 1 : 0) + (a.verified_by_trainer ? 1 : 0)
    return bScore - aScore
  })
}

export default function SavedContentPage() {
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)
  const initialContent = useSavedContent()
  const [localContent, setLocalContent] = useState<SavedContent[]>(initialContent)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortOption>('recent')

  const unsave = useUnsaveContent((id) => {
    setLocalContent((prev) => prev.filter((i) => i.recommendation_id !== id))
  })

  const filtered = applyFilter(localContent, filter)
  const sorted = applySort(filtered, sort)
  const verifiedCount = localContent.filter((i) => i.verified_by_physio || i.verified_by_trainer).length
  const userRole = auth?.role ?? 'PATIENT'

  return (
    <div className="ais-saved pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-saved__main">
        {/* ─── Hero ─── */}
        <div className="ais-saved__hero">
          <p className="ais-saved__eyebrow">Personal Library</p>
          <h1 className="ais-saved__title">Your Rehabilitation Library</h1>
          <p className="ais-saved__subtitle">Articles and guides saved across all your searches</p>
          <div className="ais-saved__stats">
            <div className="ais-saved__stat"><span className="ais-saved__stat-num">{localContent.length}</span><span>Saved</span></div>
            <div className="ais-saved__stat-divider" />
            <div className="ais-saved__stat"><span className="ais-saved__stat-num">{verifiedCount}</span><span>Verified</span></div>
            <div className="ais-saved__stat-divider" />
            <div className="ais-saved__stat"><span className="ais-saved__stat-num">3</span><span>Searches</span></div>
          </div>
        </div>

        {/* ─── Controls ─── */}
        <div className="ais-saved__controls">
          <FilterBar filter={filter} onChange={setFilter} count={sorted.length} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="ais-saved__sort-select"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="trusted">Sort: Most Trusted</option>
          </select>
        </div>

        {/* ─── Loading skeleton ─── */}
        {localContent.length === 0 && filter === 'all' && (
          <div className="ais-saved__empty">
            <span className="ais-saved__empty-emoji" aria-hidden="true">🔖</span>
            <h2 className="ais-saved__empty-title">No saved content yet</h2>
            <p className="ais-saved__empty-sub">Save articles and guides from your search results to find them here.</p>
            <button className="ais-saved__empty-cta" onClick={() => navigate('/ai-search')}>
              Search Now
            </button>
          </div>
        )}

        {/* ─── Card list ─── */}
        {sorted.length > 0 && (
          <ul className="ais-saved__list">
            {sorted.map((item) => (
              <li key={item.recommendation_id}>
                <p className="ais-saved__attribution">
                  📎 Saved from: &ldquo;<span className="ais-saved__attribution-query">{queryLabel(item.query_id)}</span>&rdquo; · {relativeDate(item.created_at)}
                </p>
                <SourceCard
                  source={item}
                  userRole={userRole}
                  mode="saved"
                  onUnsave={(id) => unsave.mutate(id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
