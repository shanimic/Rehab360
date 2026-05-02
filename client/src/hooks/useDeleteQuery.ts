import { useMutation } from '@tanstack/react-query'

// TODO: replace mutationFn with real DELETE /queries/:id call once endpoint is available
export function useDeleteQuery(onSuccess: (queryId: string) => void) {
  return useMutation({
    mutationFn: async (queryId: string): Promise<string> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return queryId
    },
    onSuccess,
  })
}
