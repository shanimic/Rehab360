import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'

export interface CreateVisitSummaryPayload {
  visit_date: string
  visit_time: string
  treatment_area: string
  medical_diagnosis: string
  description: string
  recommendations?: string
  patient_id: string
  therapist_id: string
  therapist_role: string
  copy_previous_plan?: boolean
}

export function useCreateVisitSummary() {
  return useMutation({
    mutationFn: async (payload: CreateVisitSummaryPayload) => {
      const res = await apiClient.post<{ session_id: number }>('/visit-summary', payload)
      return res.data
    },
  })
}
