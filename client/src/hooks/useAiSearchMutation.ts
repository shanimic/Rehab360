import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { mockSearchResults } from '@/mocks/aiSearchMocks'
import type { AiConversation } from '@/types'

// TODO: replace mutationFn with real Gemini API call once endpoint is available
export function useAiSearchMutation() {
  const setSearchResults = useSetAtom(searchResultsAtom)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (queryContent: string): Promise<AiConversation> => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return [
        {
          query_id: `q-${Date.now()}`,
          query_content: queryContent,
          ai_summary:
            "Some discomfort after knee exercises is normal, especially when starting a new program. However, sharp or intense pain may indicate injury. It is important to differentiate between muscle soreness (DOMS) which typically peaks 24–48 hours post-exercise, and joint pain which should be evaluated by a professional. Always follow your physiotherapist's guidance on pain thresholds during rehabilitation.",
          sources: mockSearchResults,
        },
      ]
    },
    onSuccess: (conversation) => {
      setSearchResults(conversation)
      navigate('/ai-search/results')
    },
  })
}
