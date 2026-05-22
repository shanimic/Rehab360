import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useUnsaveContent } from '@/hooks/useUnsaveContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import PatientTopNav from '@/components/PatientTopNav'
import TopNav from '@/components/TopNav'
import BackButton from '@/components/ui/BackButton'
import FilterBar from './components/FilterBar'
import SourceCard from './components/SourceCard'
import type { FilterKey } from './components/FilterBar'
import type { SavedContent } from '@/types'
import './SavedContentPage.css'

function applyFilter(items: SavedContent[], filter: FilterKey): SavedContent[] {
  if (filter === 'verified') return items.filter((i) => i.physio_verification_count > 0 || i.trainer_verification_count > 0)
  if (filter === 'unverified') return items.filter((i) => i.physio_verification_count === 0 && i.trainer_verification_count === 0)
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

  const userRole = auth?.role ?? 'PATIENT'
  const verifyContent = useVerifyContent()
  const canVerify = userRole === 'PHYSIOTHERAPIST' || userRole === 'FITNESS_TRAINER'

  function handleVerify(url: string, queryId: number) {
    const field = userRole === 'PHYSIOTHERAPIST' ? 'physio_verification_count' : 'trainer_verification_count'
    const item = localContent.find((i) => i.source_url === url)
    const currentCount = item?.[field] ?? 0
    const nextVerified = currentCount === 0
    setLocalContent((prev) =>
      prev.map((i) =>
        i.source_url !== url
          ? i
          : { ...i, [field]: nextVerified ? currentCount + 1 : Math.max(currentCount - 1, 0) }
      )
    )
    verifyContent.mutate({ url, query_id: queryId, verified: nextVerified })
  }

  const filtered = applyFilter(localContent, filter)
  const verifiedCount = localContent.filter((i) => i.physio_verification_count > 0 || i.trainer_verification_count > 0).length

  const HOME_ROUTE: Record<ApiRole, string> = {
    PATIENT: '/patient',
    PHYSIOTHERAPIST: '/physiotherapist/home',
    FITNESS_TRAINER: '/fitness/home',
  }

  return (
    <div className="ais-saved pt-16">
      {userRole === 'PATIENT' ? <PatientTopNav patientName={auth?.first_name} /> : <TopNav />}

      <main className="ais-saved__main">
        {/* ─── Page title ─── */}
        <div className="ais-saved__page-title">
          <BackButton onClick={() => navigate(HOME_ROUTE[userRole])} aria-label="Back to home" />
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
                  title={item.content_title}
                  url={item.source_url}
                  description={item.content_text}
                  contentType={item.content_type}
                  physioVerificationCount={item.physio_verification_count}
                  trainerVerificationCount={item.trainer_verification_count}
                  userRole={userRole}
                  isVerifiedByMe={
                    (userRole === 'PHYSIOTHERAPIST' && item.physio_verification_count > 0) ||
                    (userRole === 'FITNESS_TRAINER' && item.trainer_verification_count > 0)
                  }
                  onVerify={canVerify ? () => handleVerify(item.source_url, item.query_id) : undefined}
                  onRemove={() => unsave.mutate(item.saving_id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
