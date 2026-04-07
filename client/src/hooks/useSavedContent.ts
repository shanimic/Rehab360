import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { mockSavedContent } from '@/mocks/aiSearchMocks'
import type { SavedContent } from '@/types'

// TODO: replace with useQuery once saved content API endpoint is available
export function useSavedContent(): SavedContent[] {
  const auth = useAtomValue(authAtom)
  if (!auth?.email) return []
  // Mock data is scoped to MOCK_USER_EMAIL; in prod filter by auth.email via API
  return mockSavedContent
}
