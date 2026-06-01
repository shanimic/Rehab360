import { useAtomValue } from 'jotai'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'

interface RoleRouteProps {
  allowedRoles: ApiRole[]
  children: ReactNode
}

function homeForRole(role: ApiRole): string {
  if (role === 'PATIENT') return '/patient'
  if (role === 'PHYSIOTHERAPIST') return '/physiotherapist/home'
  if (role === 'FITNESS_TRAINER') return '/fitness/home'
  return '/login'
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const auth = useAtomValue(authAtom)
  if (auth === null) return <Navigate to="/" replace />
  if (!allowedRoles.includes(auth.role)) return <Navigate to={homeForRole(auth.role)} replace />
  return <>{children}</>
}
