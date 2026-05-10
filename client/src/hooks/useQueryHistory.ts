import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import apiClient from '@/lib/apiClient'
import type { AiQuery } from '@/types'

export function useQueryHistory(): AiQuery[] {
  const auth = useAtomValue(authAtom)

  const { data } = useQuery({
    queryKey: ['query-history', auth?.id],
    queryFn: () =>
      apiClient
        .get<AiQuery[]>(`/ai-search/queries/${auth?.id}`)
        .then((res) => res.data),
    enabled: !!auth?.id,
  })

  return data ?? []
}
