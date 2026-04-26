import { Fragment, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import { useSaveContent } from '@/hooks/useSaveContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import { useFollowUpMutation } from '@/hooks/useFollowUpMutation'
import PatientTopNav from '@/components/PatientTopNav'
import BackButton from '@/components/ui/BackButton'
import ExchangeBlock from './components/ExchangeBlock'
import FollowUpInput from './components/FollowUpInput'
import type { SavedContent } from '@/types'
import './AiSearchResultsPage.css'

export default function AiSearchResultsPage() {
  const navigate = useNavigate()
  const conversation = useAtomValue(searchResultsAtom)
  const auth = useAtomValue(authAtom)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [pendingBubbles, setPendingBubbles] = useState<string[]>([])
  const convLength = conversation?.length ?? 0
  const prevConvLenRef = useRef(0)

  useEffect(() => {
    if (convLength > prevConvLenRef.current) {
      const added = convLength - prevConvLenRef.current
      setPendingBubbles((prev) => prev.slice(added))
      prevConvLenRef.current = convLength
    }
  }, [convLength])

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

  return (
    <div className="ais-results pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-results__main">
        <div className="ais-results__layout">
          {/* ─── Main column ─── */}
          <div className="ais-results__content">
            <BackButton onClick={() => navigate('/ai-search')} aria-label="New Search" />

            <div className="ais-results__chat">
              {conversation.map((exchange) => (
                <Fragment key={exchange.query_id}>
                  <div className="flex justify-end">
                    <div className="ais-bubble mr-2 md:mr-4">{exchange.query_content}</div>
                  </div>
                  <ExchangeBlock
                    exchange={exchange}
                    userRole={userRole}
                    onSave={(item) => saveContent.mutate(item)}
                    onVerify={(id, role) => verifyContent.mutate({ recommendationId: id, role })}
                    savedIds={savedIds}
                  />
                </Fragment>
              ))}
              {pendingBubbles.map((text, i) => (
                <div key={`pending-${i}`} className="flex justify-end">
                  <div className="ais-bubble mr-2 md:mr-4">{text}</div>
                </div>
              ))}
            </div>

            <FollowUpInput
              conversation={conversation}
              onSubmit={(text) => {
                setPendingBubbles((prev) => [...prev, text])
                followUp.mutate({ parentQueryId: conversation[0].query_id, text })
              }}
              isPending={followUp.isPending}
            />
          </div>

          {/* ─── Right sidebar (desktop only) ─── */}
          <aside className="ais-results__sidebar hidden lg:block">
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
