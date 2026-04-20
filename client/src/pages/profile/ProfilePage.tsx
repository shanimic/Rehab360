import { useAtomValue } from 'jotai'
import { useSearchParams } from 'react-router-dom'

import PatientTopNav from '@/components/PatientTopNav'
import { authAtom } from '@/store/authAtom'
import type { ApiRole } from '@/types'

import ActivityCard from './components/ActivityCard'
import PersonalInfoCard from './components/PersonalInfoCard'
import './ProfilePage.css'

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const auth = useAtomValue(authAtom)

  const firstName = auth?.first_name ?? 'Guest'
  const role: ApiRole = auth?.role ?? (searchParams.get('role') as ApiRole) ?? 'PATIENT'

  return (
    <div className="pp-page pt-16">
      <PatientTopNav patientName={firstName} />

      <main className="pp-main">
        <div className="pp-title-row max-w-2xl mx-auto">
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
