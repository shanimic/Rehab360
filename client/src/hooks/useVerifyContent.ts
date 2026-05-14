import { useMutation } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'
import type { AiConversation } from '@/types'

export interface VerifyPayload {
  url: string
  query_id: number
  verified: boolean
}

export function useVerifyContent() {
  const conversation = useAtomValue(searchResultsAtom)
  const setConversation = useSetAtom(searchResultsAtom)
  const auth = useAtomValue(authAtom)

  return useMutation({
    mutationFn: (payload: VerifyPayload) =>
      apiClient
        .post('/ai-search/verified-content', {
          ...payload,
          user_id: auth?.id,
          user_role: auth?.role,
        })
        .then(() => payload),
    onSuccess: ({ url, verified }) => {
      if (!conversation) return
      const isPhysio = auth?.role === 'PHYSIOTHERAPIST'
      const field = isPhysio ? 'physio_verification_count' : 'trainer_verification_count'
      const updated: AiConversation = conversation.map((exchange) => ({
        ...exchange,
        sources: exchange.sources.map((source) => {
          if (source.url !== url) return source
          const current = source[field]
          return { ...source, [field]: verified ? current + 1 : Math.max(current - 1, 0) }
        }),
      }))
      setConversation(updated)
    },
  })
}
