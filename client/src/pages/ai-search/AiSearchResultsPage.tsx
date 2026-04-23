import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import { useSaveContent } from '@/hooks/useSaveContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import { useFollowUpMutation } from '@/hooks/useFollowUpMutation'
import PatientTopNav from '@/components/PatientTopNav'
import ExchangeBlock from './components/ExchangeBlock'
import FollowUpInput from './components/FollowUpInput'
import type { SavedContent } from '@/types'
import './AiSearchResultsPage.css'

export default function AiSearchResultsPage() {
  const navigate = useNavigate()
  const conversation = useAtomValue(searchResultsAtom)
  const auth = useAtomValue(authAtom)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const saveContent = useSaveContent((item: SavedContent) => {
    setSavedIds((prev) => new Set([...prev, item.recommendation_id]))
  })
  const verifyContent = useVerifyContent()
  const followUp = useFollowUpMutation()

  if (!conversation) {
    navigate('/ai-search', { replace: true })
    return null
  }

  const userRole = auth?.role ?? 'PATIENT'
  const allSources = conversation.flatMap((e) => e.sources)
  const verifiedByClinic = allSources.filter((s) => s.is_injected).length
  const verifiedByTrainer = allSources.filter((s) => s.verified_by_trainer).length
  const notVerified = allSources.filter((s) => !s.verified_by_physio && !s.verified_by_trainer).length
  const firstQuery = conversation[0]?.query_content ?? ''

  return (
    <div className="ais-results pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-results__main">
        <div className="ais-results__layout">
          {/* ─── Left / main column ─── */}
          <div className="ais-results__content">
            <div className="ais-results__breadcrumb">
              <button onClick={() => navigate('/ai-search')} className="ais-results__back-link">
                <span className="hidden lg:inline">AI Search / {firstQuery.slice(0, 50)}{firstQuery.length > 50 ? '…' : ''}</span>
                <span className="lg:hidden">← New Search</span>
              </button>
            </div>

            <div className="ais-results__exchanges">
              {conversation.map((exchange, i) => (
                <div key={exchange.query_id}>
                  {i > 0 && (
                    <div className="ais-results__separator">
                      <span>💬 Follow-up question</span>
                    </div>
                  )}
                  <ExchangeBlock
                    exchange={exchange}
                    isLast={i === conversation.length - 1}
                    userRole={userRole}
                    onSave={(item) => saveContent.mutate(item)}
                    onVerify={(id, role) => verifyContent.mutate({ recommendationId: id, role })}
                    savedIds={savedIds}
                  />
                </div>
              ))}
            </div>

            <FollowUpInput
              conversation={conversation}
              onSubmit={(text) => followUp.mutate({ parentQueryId: conversation[0].query_id, text })}
              isPending={followUp.isPending}
            />
          </div>

          {/* ─── Right sidebar (desktop only) ─── */}
          <aside className="ais-results__sidebar hidden lg:block">
            <div className="ais-results__sidebar-card">
              <h3 className="ais-results__sidebar-title">Source breakdown</h3>
              <ul className="ais-results__sidebar-stats">
                <li><span className="font-medium text-blue-600">{verifiedByClinic}</span> verified by clinic</li>
                <li><span className="font-medium text-green-600">{verifiedByTrainer}</span> verified by trainer</li>
                <li><span className="font-medium text-gray-400">{notVerified}</span> not verified</li>
              </ul>
            </div>
            <div className="ais-results__sidebar-card">
              <h3 className="ais-results__sidebar-title">This session</h3>
              <p className="text-sm text-gray-500 mb-2">{conversation.length} {conversation.length === 1 ? 'exchange' : 'exchanges'}</p>
              <div className="ais-results__progress-bar">
                <div className="ais-results__progress-fill" style={{ width: `${Math.min(conversation.length * 20, 100)}%` }} />
              </div>
            </div>
            <div className="ais-results__sidebar-card ais-results__sidebar-card--clinic">
              <h3 className="ais-results__sidebar-title">Clinic content active</h3>
              <p className="text-xs text-green-700">Your clinic&apos;s professionals have added trusted content to these results.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
