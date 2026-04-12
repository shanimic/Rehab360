// TODO: replace with real API call once GET /api/patients/me/plans endpoint is available
import { useQuery } from '@tanstack/react-query'

import type { ActivePlan } from '@/types'

const MOCK_PLANS: ActivePlan[] = [
  { plan_id: 1, goal: 'Increase knee stability', start_date: '2024-01-11', end_date: '2024-02-11' },
  { plan_id: 2, goal: 'Improve shoulder mobility', start_date: '2024-01-18', end_date: '2024-02-18' },
]

export function useMyPlans() {
  return useQuery<ActivePlan[]>({
    queryKey: ['profile', 'plans'],
    queryFn: () => Promise.resolve(MOCK_PLANS),
  })
}
