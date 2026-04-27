import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { ActivePlan } from '@/types'

export function useMyPlans() {
  const user = useAtomValue(authAtom)

  return useQuery<ActivePlan[]>({
    queryKey: ['profile', 'plans'],
    queryFn: async () => {
      const res = await apiClient.get(`/profile/${user!.id}/plans`)
      return res.data as ActivePlan[]
    },
    enabled: !!user?.id,
  })
}
