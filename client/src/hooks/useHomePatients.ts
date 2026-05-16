import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { HomePatientCard } from '@/types'

export function useHomePatients() {
  const auth = useAtomValue(authAtom)
  return useQuery<HomePatientCard[]>({
    queryKey: ['homePatients', auth?.id, auth?.role],
    queryFn: async () => {
      const res = await apiClient.get<HomePatientCard[]>('/home/patients', {
        params: { therapist_id: auth!.id, therapist_role: auth!.role },
      })
      return res.data
    },
    enabled: !!auth?.id && !!auth?.role,
  })
}
