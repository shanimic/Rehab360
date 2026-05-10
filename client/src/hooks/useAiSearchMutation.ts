import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'
import type { AiExchange, AiConversation } from '@/types'

interface AiSearchApiResponse {
  query_id: number
  summary: string
  sources: AiExchange['sources']
}

export function useAiSearchMutation() {
  const queryClient = useQueryClient()
  const setSearchResults = useSetAtom(searchResultsAtom)
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)

  return useMutation({
    mutationFn: async (queryContent: string): Promise<AiConversation> => {
      const response = await apiClient.post<AiSearchApiResponse>('/ai-search/queries', {
        query_text: queryContent,
        user_id: auth?.id,
        user_role: auth?.role,
      })
      const { query_id, summary, sources } = response.data
      const exchange: AiExchange = {
        query_id,
        query_content: queryContent,
        ai_summary: summary,
        sources,
      }
      return [exchange]
    },
    onSuccess: (newExchanges) => {
      setSearchResults((prev) => [...(prev ?? []), ...newExchanges])
      queryClient.invalidateQueries({ queryKey: ['query-history'] })
      navigate('/ai-search/results')
    },
    onError: (error) => {
      console.error('[AI Search] mutation failed:', error)
    },
  })
}
