import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { mockQueryHistory } from '@/mocks/aiSearchMocks'
import type { AiQuery } from '@/types'

// TODO: replace with useQuery once query history API endpoint is available
export function useQueryHistory(): AiQuery[] {
  const auth = useAtomValue(authAtom)
  if (!auth?.email) return []
  return mockQueryHistory.filter((q) => q.user_id === auth.email)
}
