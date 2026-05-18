import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import type { PatientDetailsResponse } from '@/types'

export async function getPatientDetails(
  patientId: string,
  viewerRole?: string,
): Promise<PatientDetailsResponse> {
  const res = await apiClient.get<PatientDetailsResponse>(
    `/patient-details/${patientId}`,
    { params: viewerRole ? { viewer_role: viewerRole } : undefined },
  )
  return res.data
}

export function usePatientDetails(patientId: string | undefined) {
  const auth = useAtomValue(authAtom)
  return useQuery<PatientDetailsResponse>({
    queryKey: ['patientDetails', patientId, auth?.role],
    queryFn: () => getPatientDetails(patientId!, auth?.role),
    enabled: !!patientId && !!auth?.role,
  })
}
