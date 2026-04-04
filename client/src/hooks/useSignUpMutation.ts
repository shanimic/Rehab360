import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { SignUpRequest, SignUpResponse } from '@/types'

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<SignUpResponse> => {
      const res = await apiClient.post('/users/register', data)
      return res.data
    },
  })
}
