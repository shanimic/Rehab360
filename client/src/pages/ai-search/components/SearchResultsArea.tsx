import { Fragment, useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useSaveContent } from '@/hooks/useSaveContent'
import { useUnsaveContent } from '@/hooks/useUnsaveContent'
import { useSavedContent } from '@/hooks/useSavedContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import ExchangeBlock from './ExchangeBlock'
import type { AiConversation } from '@/types'
import type { SavePayload } from '@/hooks/useSaveContent'

interface SearchResultsAreaProps {
  exchanges: AiConversation
  isPending: boolean
  // Shown as a bubble while loading so the user sees what they submitted
  pendingQuery?: string
}

export default function SearchResultsArea({ exchanges, isPending, pendingQuery }: SearchResultsAreaProps) {
  const auth = useAtomValue(authAtom)
  const savedContent = useSavedContent()
  const savedMap = useMemo(
    () => new Map(savedContent.map((i) => [i.source_url, i.saving_id])),
    [savedContent],
  )
  const saveContent = useSaveContent(() => {})
  const unsaveContent = useUnsaveContent(() => {})
  const verifyContent = useVerifyContent()

  const userRole = auth?.role ?? 'PATIENT'

  useEffect(() => {
    if (!isPending) return
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })
  }, [isPending])

  function handleSave(payload: SavePayload) {
    const savingId = savedMap.get(payload.url)
    if (savingId !== undefined) {
      unsaveContent.mutate(savingId)
    } else {
      saveContent.mutate(payload)
    }
  }

  function handleVerify(url: string, queryId: number, currentlyVerified: boolean) {
    verifyContent.mutate({ url, query_id: queryId, verified: !currentlyVerified })
  }

  return (
    <div className="ais-page__chat">
      {exchanges.map((exchange) => (
        <Fragment key={exchange.query_id}>
          <div className="flex justify-end">
            <div className="ais-bubble mr-2 md:mr-4">{exchange.query_content}</div>
          </div>
          <ExchangeBlock
            exchange={exchange}
            userRole={userRole}
            onSave={handleSave}
            onVerify={handleVerify}
            savedMap={savedMap}
          />
        </Fragment>
      ))}
      {isPending && (
        <>
          {pendingQuery && (
            <div className="flex justify-end">
              <div className="ais-bubble mr-2 md:mr-4">{pendingQuery}</div>
            </div>
          )}
          <div className="ais-page__skeleton-response ais-skeleton mb-3" />
          <div className="ais-page__skeleton-card ais-skeleton mb-2" />
          <div className="ais-page__skeleton-card ais-skeleton mb-2" />
          <div className="ais-page__skeleton-card ais-skeleton" />
        </>
      )}
    </div>
  )
}
