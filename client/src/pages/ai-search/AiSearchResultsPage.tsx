import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import { useSaveContent } from '@/hooks/useSaveContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import { useAiSearchMutation } from '@/hooks/useAiSearchMutation'
import PatientTopNav from '@/components/PatientTopNav'
import BackButton from '@/components/ui/BackButton'
import ExchangeBlock from './components/ExchangeBlock'
import NewSearchInput from './components/NewSearchInput'
import type { SavePayload } from '@/hooks/useSaveContent'
import './AiSearchResultsPage.css'

export default function AiSearchResultsPage() {
  const navigate = useNavigate()
  const conversation = useAtomValue(searchResultsAtom)
  const auth = useAtomValue(authAtom)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const saveContent = useSaveContent(() => {})
  const verifyContent = useVerifyContent()
  const searchMutation = useAiSearchMutation()

  if (!conversation) {
    navigate('/ai-search', { replace: true })
    return null
  }

  const userRole = auth?.role ?? 'PATIENT'

  function handleSave(payload: SavePayload) {
    setSavedIds((prev) => new Set([...prev, payload.url]))
    saveContent.mutate(payload)
  }

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
                    onSave={handleSave}
                    onVerify={(url, verified) => verifyContent.mutate({ url, query_id: exchange.query_id, verified })}
                    savedIds={savedIds}
                  />
                </Fragment>
              ))}
            </div>

            <NewSearchInput
              onSubmit={(text) => searchMutation.mutate(text)}
              isPending={searchMutation.isPending}
            />
          </div>

          {/* ─── Right sidebar (desktop only) ─── */}
          <aside className="ais-results__sidebar hidden lg:block" />
        </div>
      </main>
    </div>
  )
}
