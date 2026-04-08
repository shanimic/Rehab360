import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { ApiRole, LoginRequest, LoginResponse } from '@/types'

export function useLoginMutation() {
  const setAuth = useSetAtom(authAtom)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const res = await apiClient.post('/users/login', data)
      return res.data
    },
    onSuccess: (data: LoginResponse) => {
      setAuth(data)
      navigateToHome(data.role, navigate)
    },
  })
}

function navigateToHome(role: ApiRole, navigate: (path: string) => void): void {
  if (role === 'PATIENT') {
    navigate('/patient')
  } else if (role === 'PHYSIOTHERAPIST') {
    navigate('/physiotherapist')
  } else if (role === 'FITNESS_TRAINER') {
    navigate('/placeholder')
  }
}
