import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'

export interface SavePayload {
  title: string
  url: string
  content_text: string | null
  content_type: string
  query_id: number
}

export function useSaveContent(onSuccess: () => void) {
  const queryClient = useQueryClient()
  const auth = useAtomValue(authAtom)

  return useMutation({
    mutationFn: (payload: SavePayload) =>
      apiClient.post('/ai-search/saved-content', {
        ...payload,
        user_id: auth?.id,
        user_role: auth?.role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-content'] })
      onSuccess()
    },
  })
}
