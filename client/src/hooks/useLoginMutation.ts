import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { LoginRequest, LoginResponse } from '@/types'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const res = await apiClient.post('/users/login', data)
      return res.data
    },
  })
}
