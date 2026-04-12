// TODO: replace with real API call once GET /api/profile/preferences endpoint is available
import { useQuery } from '@tanstack/react-query'

import type { ProfilePreferences } from '@/types'

const MOCK_PREFERENCES: ProfilePreferences = {
  notification_enabled: true,
  language: 'English',
}

export function useProfilePreferences() {
  return useQuery<ProfilePreferences>({
    queryKey: ['profile', 'preferences'],
    queryFn: () => Promise.resolve(MOCK_PREFERENCES),
  })
}
