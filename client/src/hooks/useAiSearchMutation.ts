import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'
import type { AiExchange, AiConversation, SearchMode } from '@/types'

interface AiSearchApiResponse {
  query_id: number
  summary: string
  sources: AiExchange['sources']
}

interface AiSearchMutationArgs {
  query: string
  searchMode: SearchMode
}

export function useAiSearchMutation() {
  const queryClient = useQueryClient()
  const setSearchResults = useSetAtom(searchResultsAtom)
  const searchResults = useAtomValue(searchResultsAtom)
  const auth = useAtomValue(authAtom)

  return useMutation({
    mutationFn: async ({ query: queryContent, searchMode }: AiSearchMutationArgs): Promise<AiConversation> => {
      const history = (searchResults ?? []).map((ex) => ({
        query: ex.query_content,
        answer: ex.ai_summary,
      }))
      const response = await apiClient.post<AiSearchApiResponse>('/ai-search/queries', {
        query_text: queryContent,
        user_id: auth?.id,
        user_role: auth?.role,
        conversation_history: history,
        search_mode: searchMode,
      })
      const { query_id, summary, sources } = response.data
      const sortedSources = [...sources].sort((a, b) => {
        const aV = a.physio_verification_count > 0 || a.trainer_verification_count > 0 ? 1 : 0
        const bV = b.physio_verification_count > 0 || b.trainer_verification_count > 0 ? 1 : 0
        return bV - aV
      })
      const exchange: AiExchange = {
        query_id,
        query_content: queryContent,
        ai_summary: summary,
        sources: sortedSources,
      }
      return [exchange]
    },
    onSuccess: (newExchanges) => {
      setSearchResults((prev) => [...(prev ?? []), ...newExchanges])
      queryClient.invalidateQueries({ queryKey: ['query-history'] })
    },
    onError: (error) => {
      console.error('[AI Search] mutation failed:', error)
    },
  })
}
