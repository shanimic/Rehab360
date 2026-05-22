import { useAtomValue } from 'jotai'
import { useSearchParams, useNavigate } from 'react-router-dom'

import TopNav from '@/components/TopNav'
import BackButton from '@/components/ui/BackButton'
import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'

import ActivityCard from './components/ActivityCard'
import PersonalInfoCard from './components/PersonalInfoCard'
import './ProfilePage.css'

const HOME_ROUTE: Record<ApiRole, string> = {
  PATIENT: '/patient',
  PHYSIOTHERAPIST: '/physiotherapist/home',
  FITNESS_TRAINER: '/fitness/home',
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const auth = useAtomValue(authAtom)
  const navigate = useNavigate()

  const firstName = auth?.first_name ?? 'Guest'
  const role: ApiRole = auth?.role ?? (searchParams.get('role') as ApiRole) ?? 'PATIENT'

  const handleBack = () => navigate(HOME_ROUTE[role] ?? '/')

  return (
    <div className="pp-page pt-16">
      <TopNav />

      <main className="pp-main">
        <div className="pp-title-row max-w-2xl mx-auto">
          <BackButton onClick={handleBack} />
          <h1 className="pp-title">My Profile</h1>
        </div>

        <div className="pp-cards-grid max-w-2xl mx-auto">
          <PersonalInfoCard firstName={firstName} role={role} />
          {role === 'PATIENT' && <ActivityCard />}
        </div>
      </main>
    </div>
  )
}
