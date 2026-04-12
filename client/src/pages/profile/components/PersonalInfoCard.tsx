import { Mail, Phone, Calendar, Award } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useProfileData } from '@/hooks/useProfileData'
import type { ApiRole } from '@/types'

interface PersonalInfoCardProps {
  firstName: string
  email: string
  role: ApiRole
}

const ROLE_LABELS: Record<ApiRole, string> = {
  PATIENT: 'Patient',
  PHYSIOTHERAPIST: 'Physiotherapist',
  FITNESS_TRAINER: 'Fitness Trainer',
}

function formatBirthDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export default function PersonalInfoCard({ firstName, email, role }: PersonalInfoCardProps) {
  const { data } = useProfileData()

  const initials = data
    ? `${firstName[0] ?? ''}${data.last_name[0] ?? ''}`.toUpperCase()
    : (firstName[0]?.toUpperCase() ?? '?')

  const showLicense = role === 'PHYSIOTHERAPIST' || role === 'FITNESS_TRAINER'

  return (
    <div className="pp-card">
      <h2 className="pp-card__title">Personal Info</h2>

      <div className="pp-personal__avatar-row">
        <div className="pp-personal__avatar">{initials}</div>
        <div className="pp-personal__name-block">
          <span className="pp-personal__name">
            {firstName} {data?.last_name ?? ''}
          </span>
          <Badge className="pp-personal__role-badge">
            {ROLE_LABELS[role]}
          </Badge>
        </div>
      </div>

      <div className="pp-personal__fields">
        <div className="pp-personal__field">
          <Mail size={15} className="pp-personal__field-icon" />
          <span className="pp-personal__field-value">{email}</span>
        </div>
        <div className="pp-personal__field">
          <Phone size={15} className="pp-personal__field-icon" />
          <span className="pp-personal__field-value">{data?.phone ?? '—'}</span>
        </div>
        <div className="pp-personal__field">
          <Calendar size={15} className="pp-personal__field-icon" />
          <span className="pp-personal__field-value">
            {data?.birth_date ? formatBirthDate(data.birth_date) : '—'}
          </span>
        </div>
        {showLicense && (
          <div className="pp-personal__field">
            <Award size={15} className="pp-personal__field-icon" />
            <span className="pp-personal__field-value">{data?.license_number ?? '—'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
