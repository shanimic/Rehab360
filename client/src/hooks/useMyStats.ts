// TODO: replace with real API call once GET /api/professionals/me/stats endpoint is available
import { useQuery } from '@tanstack/react-query'

import type { ProfessionalStats } from '@/types'

const MOCK_STATS: ProfessionalStats = {
  total_visits: 2,
  active_plans: 2,
}

export function useMyStats() {
  return useQuery<ProfessionalStats>({
    queryKey: ['profile', 'stats'],
    queryFn: () => Promise.resolve(MOCK_STATS),
  })
}
