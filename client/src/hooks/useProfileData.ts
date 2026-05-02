import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { ProfileData } from '@/types'

export function useProfileData() {
  const user = useAtomValue(authAtom)

  return useQuery<ProfileData>({
    queryKey: ['profile', 'personal'],
    queryFn: async () => {
      const res = await apiClient.get(`/profile/${user!.id}`)
      return res.data as ProfileData
    },
    enabled: !!user?.id,
  })
}
