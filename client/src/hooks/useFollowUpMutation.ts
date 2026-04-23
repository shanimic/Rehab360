import { useMutation } from '@tanstack/react-query'
import { useSetAtom, useAtomValue } from 'jotai'
import { searchResultsAtom } from '@/store/aiSearchAtom'
import { mockSearchResults } from '@/mocks/aiSearchMocks'
import type { AiExchange } from '@/types'

// TODO: replace mutationFn with real Gemini follow-up API call once endpoint is available
export function useFollowUpMutation() {
  const conversation = useAtomValue(searchResultsAtom)
  const setConversation = useSetAtom(searchResultsAtom)

  return useMutation({
    mutationFn: async (_params: { parentQueryId: string; text: string }): Promise<AiExchange> => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        query_id: `q-followup-${Date.now()}`,
        query_content: _params.text,
        ai_summary:
          'This is a follow-up response from Gemini AI. Recovery typically follows a progressive timeline depending on the specific injury, individual health factors, and adherence to the rehabilitation program. Your physiotherapist can provide a personalised estimate based on your progress assessments.',
        sources: mockSearchResults.slice(0, 2),
      }
    },
    onSuccess: (newExchange) => {
      if (!conversation) return
      setConversation([...conversation, newExchange])
    },
  })
}
