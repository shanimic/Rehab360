import { useLocation } from 'react-router-dom'
import type { PageTransitionProps } from '@/types'
import './PageTransition.css'

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}
