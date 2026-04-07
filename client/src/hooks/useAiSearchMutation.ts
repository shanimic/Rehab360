import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { mockSearchResults } from '@/mocks/aiSearchMocks'
import type { AiSearchResult } from '@/types'

// TODO: replace mutationFn with real Gemini API call once endpoint is available
export function useAiSearchMutation() {
  const setSearchResults = useSetAtom(searchResultsAtom)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (queryContent: string): Promise<AiSearchResult> => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        query: {
          query_id: `q-${Date.now()}`,
          user_id: '',
          query_content: queryContent,
          ai_response:
            'Some discomfort after knee exercises is normal, especially when starting a new program. However, sharp or intense pain may indicate injury. It is important to differentiate between muscle soreness (DOMS) which typically peaks 24–48 hours post-exercise, and joint pain which should be evaluated by a professional. Always follow your physiotherapist\'s guidance on pain thresholds during rehabilitation.',
          query_date: new Date().toISOString().split('T')[0],
          query_time: new Date().toTimeString().split(' ')[0],
        },
        sources: mockSearchResults,
      }
    },
    onSuccess: (result) => {
      setSearchResults(result)
      navigate('/ai-search/results')
    },
  })
}
