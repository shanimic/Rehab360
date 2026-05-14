import { useMutation, useQuery } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { HasPreviousPlanResponse, SessionListItem, VisitSummaryDetails, VisitSummaryPatientData } from '@/types'

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

export function useVisitSummaryDetail(sessionId: number | undefined) {
  return useQuery<VisitSummaryDetails>({
    queryKey: ['visitSummaryDetail', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<VisitSummaryDetails>(`/visit-summary/${sessionId}`)
      return res.data
    },
    enabled: typeof sessionId === 'number' && !Number.isNaN(sessionId),
  })
}

export function useHasPreviousPlan(
  patientId: string | undefined,
  visitType: string | undefined,
) {
  return useQuery<HasPreviousPlanResponse>({
    queryKey: ['hasPreviousPlan', patientId, visitType],
    queryFn: async () => {
      const res = await apiClient.get<HasPreviousPlanResponse>(
        `/visit-summary/has-previous-plan/${patientId}?visit_type=${visitType}`,
      )
      return res.data
    },
    enabled: !!patientId && !!visitType,
  })
}

export function useEnsurePlan() {
  return useMutation({
    mutationFn: (sessionId: number) =>
      apiClient.post(`/visit-summary/ensure-plan/${sessionId}`),
  })
}
