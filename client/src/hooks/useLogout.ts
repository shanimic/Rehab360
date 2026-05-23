import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authAtom } from '@/store/authAtom'
import { currentQueryAtom, searchResultsAtom } from '@/store/aiSearchAtom'
import type { ApiRole } from '@/types'

export function useLogout() {
  const setAuth = useSetAtom(authAtom)
  const setCurrentQuery = useSetAtom(currentQueryAtom)
  const setSearchResults = useSetAtom(searchResultsAtom)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return (role: ApiRole | undefined) => {
    setAuth(null)
    setCurrentQuery('')
    setSearchResults(null)

    const loginRole =
      role === 'PHYSIOTHERAPIST' ? 'physiotherapist'
      : role === 'FITNESS_TRAINER' ? 'trainer'
      : 'patient'

    navigate(`/login?role=${loginRole}`)

    queryClient.clear()
  }
}
