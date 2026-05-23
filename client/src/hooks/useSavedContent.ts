import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'
import type { SavedContent } from '@/types'

const EMPTY: SavedContent[] = []

export function useSavedContent(): SavedContent[] {
  const auth = useAtomValue(authAtom)

  const { data } = useQuery({
    queryKey: ['saved-content', auth?.id],
    queryFn: () =>
      apiClient
        .get<SavedContent[]>(`/ai-search/saved-content/${auth?.id}`)
        .then((res) => res.data),
    enabled: !!auth?.id,
  })

  return data ?? EMPTY
}
