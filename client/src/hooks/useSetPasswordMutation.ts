import { useMutation } from '@tanstack/react-query'

interface SetPasswordRequest {
  password: string
  confirmPassword: string
}

export function useSetPasswordMutation() {
  return useMutation({
    mutationFn: async (_data: SetPasswordRequest) => {
      // TODO: connect to API
      // return axios.post('/api/auth/set-password', _data).then((res) => res.data)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })
}
