import { useMutation, useQuery } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type {
  CreateTreatmentPlanRequest,
  CreateTreatmentPlanResponse,
  PhysiotherapyExerciseItem,
  TreatmentPlanContext,
  TreatmentPlanDetailsResponse,
} from '@/types'

export function useTreatmentPlanContext(sessionId: number | null) {
  return useQuery<TreatmentPlanContext>({
    queryKey: ['treatmentPlanContext', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<TreatmentPlanContext>(
        `/treatment-plan/context/${sessionId}`,
      )
      return res.data
    },
    enabled: sessionId !== null,
  })
}

export function usePhysiotherapyExercises() {
  return useQuery<PhysiotherapyExerciseItem[]>({
    queryKey: ['physiotherapyExercises'],
    queryFn: async () => {
      const res = await apiClient.get<PhysiotherapyExerciseItem[]>('/treatment-plan/exercises')
      return res.data
    },
  })
}

export function useTreatmentPlanDetails(planId: number | undefined) {
  return useQuery<TreatmentPlanDetailsResponse>({
    queryKey: ['treatmentPlanDetails', planId],
    queryFn: async () => {
      const res = await apiClient.get<TreatmentPlanDetailsResponse>(
        `/treatment-plan/plan/${planId}`,
      )
      return res.data
    },
    enabled: typeof planId === 'number' && !Number.isNaN(planId),
  })
}

export function useCreateTreatmentPlan() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      body,
    }: {
      sessionId: number
      body: CreateTreatmentPlanRequest
    }) => {
      const res = await apiClient.post<CreateTreatmentPlanResponse>(
        `/treatment-plan/${sessionId}`,
        body,
      )
      return res.data
    },
  })
}
