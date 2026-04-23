import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SavedContent } from '@/types'

// TODO: replace mutationFn with real POST /saved-content call once endpoint is available
export function useSaveContent(onSuccess: (item: SavedContent) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: SavedContent): Promise<SavedContent> => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return item
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['saved-content'] })
      onSuccess(item)
    },
  })
}
