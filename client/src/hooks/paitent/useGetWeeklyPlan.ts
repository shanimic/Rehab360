import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { WeeklyPlanResponse } from '@/types/patient'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

export function useGetWeeklyPlan(enabled: boolean) {
  const user = useAtomValue(authAtom)
  const patientId = user?.id

  return useQuery({
    queryKey: ['weeklyPlan', patientId],
    queryFn: async (): Promise<WeeklyPlanResponse> => {
      const res = await apiClient.get(`/exercise/${patientId}/weekly`)
      return res.data
    },
    enabled: enabled && !!patientId,
  })
}
