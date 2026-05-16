import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import type { AllPatientItem } from '@/types'

export function useAllPatients() {
  return useQuery<AllPatientItem[]>({
    queryKey: ['allPatients'],
    queryFn: async () => {
      const res = await apiClient.get<AllPatientItem[]>('/home/all-patients')
      return res.data
    },
  })
}
