import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export function useDeleteQuery(onSuccess: (queryId: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (queryId: number) =>
      apiClient.delete(`/ai-search/queries/${queryId}`).then(() => queryId),
    onSuccess: (queryId) => {
      queryClient.invalidateQueries({ queryKey: ['query-history'] })
      onSuccess(queryId)
    },
  })
}
