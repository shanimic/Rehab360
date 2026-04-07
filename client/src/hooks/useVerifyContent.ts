import { useMutation } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import type { AiSearchResult } from '@/types'

interface VerifyPayload {
  recommendationId: string
  role: string
}

// TODO: replace mutationFn with real PATCH /saved-content/:id/verify call once endpoint is available
export function useVerifyContent() {
  const results = useAtomValue(searchResultsAtom)
  const setResults = useSetAtom(searchResultsAtom)

  return useMutation({
    mutationFn: async (payload: VerifyPayload): Promise<VerifyPayload> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return payload
    },
    onSuccess: ({ recommendationId, role }) => {
      if (!results) return
      const updated: AiSearchResult = {
        ...results,
        sources: results.sources.map((source) => {
          if (source.recommendation_id !== recommendationId) return source
          const alreadyVerified = source.verifiedBy.includes(role)
          return {
            ...source,
            verifiedBy: alreadyVerified
              ? source.verifiedBy.filter((r) => r !== role)
              : [...source.verifiedBy, role],
          }
        }),
      }
      setResults(updated)
    },
  })
}
