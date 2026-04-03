import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { LoginRequest, LoginResponse } from '@/types'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginRequest): Promise<LoginResponse> =>
      apiClient.post('/users/login', data).then((res) => res.data),
  })
}
