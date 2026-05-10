import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useUnsaveContent(onSuccess: (recommendationId: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recommendationId: number) =>
      apiClient
        .delete(`/ai-search/saved-content/${recommendationId}`)
        .then(() => recommendationId),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['saved-content'] })
      onSuccess(id)
    },
  })
}
