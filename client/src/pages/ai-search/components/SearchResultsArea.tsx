import { Fragment, useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useSaveContent } from '@/hooks/useSaveContent'
import { useVerifyContent } from '@/hooks/useVerifyContent'
import ExchangeBlock from './ExchangeBlock'
import type { AiConversation } from '@/types'
import type { SavePayload } from '@/hooks/useSaveContent'

interface SearchResultsAreaProps {
  exchanges: AiConversation
  isPending: boolean
}

export default function SearchResultsArea({ exchanges, isPending }: SearchResultsAreaProps) {
  const auth = useAtomValue(authAtom)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const saveContent = useSaveContent(() => {})
  const verifyContent = useVerifyContent()

  const userRole = auth?.role ?? 'PATIENT'
  useEffect(() => {
    if (!isPending) return
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })
  }, [isPending])

  function handleSave(payload: SavePayload) {
    setSavedIds((prev) => new Set([...prev, payload.url]))
    saveContent.mutate(payload)
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
            onVerify={(url, verified) => verifyContent.mutate({ url, query_id: exchange.query_id, verified })}
            savedIds={savedIds}
          />
        </Fragment>
      ))}
      {isPending && (
        <div className="animate-pulse">
          <div className="ais-page__skeleton-response mb-3" />
          <div className="ais-page__skeleton-card mb-2" />
          <div className="ais-page__skeleton-card mb-2" />
          <div className="ais-page__skeleton-card" />
        </div>
      )}
    </div>
  )
}
