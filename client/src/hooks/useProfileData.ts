// TODO: replace with real API call once GET /api/profile endpoint is available
import { useQuery } from '@tanstack/react-query'

import type { ProfileData } from '@/types'

const MOCK_PROFILE_DATA: ProfileData = {
  last_name: 'Guest',
  phone: '050-1234567',
  birth_date: '1990-05-14',
  license_number: 'PT-4821',
}

export function useProfileData() {
  return useQuery<ProfileData>({
    queryKey: ['profile', 'personal'],
    queryFn: () => Promise.resolve(MOCK_PROFILE_DATA),
  })
}
