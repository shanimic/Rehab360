import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useUnsaveContent } from '@/hooks/useUnsaveContent'
import PatientTopNav from '@/components/PatientTopNav'
import BackButton from '@/components/ui/BackButton'
import FilterBar from './components/FilterBar'
import SourceCard from './components/SourceCard'
import type { FilterKey } from './components/FilterBar'
import type { SavedContent } from '@/types'
import './SavedContentPage.css'

function applyFilter(items: SavedContent[], filter: FilterKey): SavedContent[] {
  if (filter === 'verified') return items.filter((i) => i.verified_by_physio || i.verified_by_trainer)
  if (filter === 'unverified') return items.filter((i) => !i.verified_by_physio && !i.verified_by_trainer)
  return items
}

export default function SavedContentPage() {
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)
  const initialContent = useSavedContent()
  const [localContent, setLocalContent] = useState<SavedContent[]>(initialContent)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    setLocalContent(initialContent)
  }, [initialContent])

  const unsave = useUnsaveContent((id) => {
    setLocalContent((prev) => prev.filter((i) => i.saving_id !== id))
  })

  const filtered = applyFilter(localContent, filter)
  const verifiedCount = localContent.filter((i) => i.verified_by_physio || i.verified_by_trainer).length
  const userRole = auth?.role ?? 'PATIENT'

  return (
    <div className="ais-saved pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-saved__main">
        {/* ─── Page title ─── */}
        <div className="ais-saved__page-title">
          <BackButton onClick={() => navigate('/ai-search')} aria-label="Back to AI Search" />
          <h1 className="ais-saved__title">My Saved Content</h1>
        </div>

        {/* ─── Hero ─── */}
        <div className="ais-saved__hero">
          <p className="ais-saved__subtitle">Articles and guides saved across all your searches</p>
          <div className="ais-saved__stats">
            <div className="ais-saved__stat"><span className="ais-saved__stat-num">{localContent.length}</span><span>Saved</span></div>
            <div className="ais-saved__stat-divider" />
            <div className="ais-saved__stat"><span className="ais-saved__stat-num">{verifiedCount}</span><span>Verified</span></div>
          </div>
        </div>

        {/* ─── Controls ─── */}
        <div className="ais-saved__controls">
          <FilterBar filter={filter} onChange={setFilter} sources={localContent} />
        </div>

        {/* ─── Loading skeleton ─── */}
        {localContent.length === 0 && filter === 'all' && (
          <div className="ais-saved__empty">
            <Bookmark size={48} className="text-blue-400 mx-auto mb-4" aria-hidden="true" />
            <h2 className="ais-saved__empty-title">No saved content yet</h2>
            <p className="ais-saved__empty-sub">Save articles and guides from your search results to find them here.</p>
            <button className="ais-saved__empty-cta" onClick={() => navigate('/ai-search')}>
              Search Now
            </button>
          </div>
        )}

        {/* ─── Card list ─── */}
        {filtered.length > 0 && (
          <ul className="ais-saved__list">
            {filtered.map((item) => (
              <li key={item.saving_id}>
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
