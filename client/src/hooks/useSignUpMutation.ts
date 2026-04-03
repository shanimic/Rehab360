import { useMutation } from '@tanstack/react-query'

import apiClient from '@/lib/apiClient'
import type { SignUpRequest, SignUpResponse } from '@/types'

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (data: SignUpRequest): Promise<SignUpResponse> =>
      apiClient.post('/users/register', data).then((res) => res.data),
  })
}
