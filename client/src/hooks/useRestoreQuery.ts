import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { mockConversation } from '@/mocks/aiSearchMocks'
import type { AiConversation } from '@/types'

// TODO: replace mutationFn with real GET /queries/:id/conversation call once endpoint is available
export function useRestoreQuery() {
  const setConversation = useSetAtom(searchResultsAtom)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (_queryId: string): Promise<AiConversation> => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockConversation
    },
    onSuccess: (conversation) => {
      setConversation(conversation)
      navigate('/ai-search/results')
    },
  })
}
