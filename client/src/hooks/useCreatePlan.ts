import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'

export interface CreatePlanPayload {
  session_id: number
  goal: string
  start_date: string
  end_date: string
}

export interface CreatePlanResponse {
  plan_id: number
  session_id: number
}

export function useCreatePlan() {
  return useMutation({
    mutationFn: async (payload: CreatePlanPayload) => {
      const res = await apiClient.post<CreatePlanResponse>('/visit-summary/plan', payload)
      return res.data
    },
  })
}
