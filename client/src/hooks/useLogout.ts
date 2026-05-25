import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authAtom } from '@/store/authAtom'
import { currentQueryAtom, searchResultsAtom } from '@/store/aiSearchAtom'

export function useLogout() {
  const setAuth = useSetAtom(authAtom)
  const setCurrentQuery = useSetAtom(currentQueryAtom)
  const setSearchResults = useSetAtom(searchResultsAtom)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    setAuth(null)
    setCurrentQuery('')
    setSearchResults(null)
    navigate('/')
    queryClient.clear()
  }
}
