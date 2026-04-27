import { useQuery } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { SessionListItem, VisitSummaryPatientData } from '@/types'

export function useVisitSummaries(patientId: string | undefined) {
  return useQuery<SessionListItem[]>({
    queryKey: ['visitSummaries', patientId],
    queryFn: async () => {
      const res = await apiClient.get<SessionListItem[]>(`/visit-summary/sessions/${patientId}`)
      return res.data
    },
    enabled: !!patientId,
  })
}

export function useVisitSummary(patientId: string | undefined) {
  return useQuery<VisitSummaryPatientData>({
    queryKey: ['visitSummary', 'patient', patientId],
    queryFn: async () => {
      const res = await apiClient.get(`/visit-summary/patient/${patientId}`)
      return res.data
    },
    enabled: !!patientId,
  })
}
