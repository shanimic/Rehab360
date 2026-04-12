import { useAtomValue } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'

import ActivityCard from './components/ActivityCard'
import PersonalInfoCard from './components/PersonalInfoCard'
import PreferencesCard from './components/PreferencesCard'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = useAtomValue(authAtom)

  const firstName = auth?.first_name ?? 'Guest'
  const email = auth?.email ?? '—'
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
        <h1 className="pp-header__title">My Profile</h1>
      </header>

      <main className="pp-main">
        <div className="pp-cards-grid">
          <div className="pp-cards-grid__top">
            <PersonalInfoCard firstName={firstName} email={email} role={role} />
            <ActivityCard role={role} />
          </div>
          <PreferencesCard />
        </div>
      </main>
    </div>
  )
}
