import { useMutation } from '@tanstack/react-query'
import type { SignUpRequest } from '@/types'

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (_data: SignUpRequest) => {
      // TODO: connect to API
      // return axios.post('/api/auth/signup', _data).then((res) => res.data)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })
}
