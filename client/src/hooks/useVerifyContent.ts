import { useMutation } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import type { AiConversation } from '@/types'

interface VerifyPayload {
  recommendationId: string
  role: 'PHYSIOTHERAPIST' | 'FITNESS_TRAINER'
}

// TODO: replace mutationFn with real PATCH /saved-content/:id/verify call once endpoint is available
export function useVerifyContent() {
  const conversation = useAtomValue(searchResultsAtom)
  const setConversation = useSetAtom(searchResultsAtom)

  return useMutation({
    mutationFn: async (payload: VerifyPayload): Promise<VerifyPayload> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return payload
    },
    onSuccess: ({ recommendationId, role }) => {
      if (!conversation) return
      const updated: AiConversation = conversation.map((exchange) => ({
        ...exchange,
        sources: exchange.sources.map((source) => {
          if (source.recommendation_id !== recommendationId) return source
          if (role === 'PHYSIOTHERAPIST') {
            return { ...source, verified_by_physio: !source.verified_by_physio }
          }
          return { ...source, verified_by_trainer: !source.verified_by_trainer }
        }),
      }))
      setConversation(updated)
    },
  })
}
