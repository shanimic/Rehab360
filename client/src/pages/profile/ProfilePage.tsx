import { useAtomValue } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'

import ActivityCard from './components/ActivityCard'
import PersonalInfoCard from './components/PersonalInfoCard'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = useAtomValue(authAtom)

  const firstName = auth?.first_name ?? 'Guest'
  const role: ApiRole = auth?.role ?? (searchParams.get('role') as ApiRole) ?? 'PATIENT'

  return (
    <div className="pp-page">
      <header className="pp-header">
        <button
          type="button"
          className="pp-header__back-btn"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="pp-header__title text-lg font-medium">My Profile</h1>
        <span aria-hidden="true" className="pp-header__spacer" />
      </header>

      <main className="pp-main">
        <div className="pp-cards-grid max-w-2xl mx-auto">
          <PersonalInfoCard firstName={firstName} role={role} />
          {role === 'PATIENT' && <ActivityCard />}
        </div>
      </main>
    </div>
  )
}
