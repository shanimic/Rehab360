import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'
import { authAtom } from '@/store/authAtom'

// Returns auth.id for PATIENT (their routes carry no :patientId segment).
// Returns URL :patientId for PHYSIOTHERAPIST and FITNESS_TRAINER.
export function useResolvedPatientId(): string | undefined {
  const auth = useAtomValue(authAtom)
  const { patientId } = useParams<{ patientId?: string }>()
  if (auth?.role === 'PATIENT') return auth.id ?? undefined
  return patientId
}
