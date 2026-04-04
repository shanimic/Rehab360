import { useMutation } from '@tanstack/react-query'
import type { LoginRequest } from '@/types'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (_data: LoginRequest) => {
      // TODO: connect to API
      // return axios.post('/api/auth/login', _data).then((res) => res.data)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })
}
