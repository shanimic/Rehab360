import { useMutation } from '@tanstack/react-query'

// TODO: replace mutationFn with real DELETE /saved-content/:id call once endpoint is available
export function useUnsaveContent(onSuccess: (recommendationId: string) => void) {
  return useMutation({
    mutationFn: async (recommendationId: string): Promise<string> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return recommendationId
    },
    onSuccess,
  })
}
