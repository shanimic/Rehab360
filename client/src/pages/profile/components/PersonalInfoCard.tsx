import type { ReactNode } from 'react'
import { Mail, Phone, Calendar, BadgeCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useProfileData } from '@/hooks/useProfileData'
import type { ApiRole } from '@/types'

interface PersonalInfoCardProps {
  firstName: string
  role: ApiRole
}

interface InfoFieldProps {
  icon: ReactNode
  label: string
  value: string
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

function InfoField({ icon, label, value }: InfoFieldProps) {
  return (
    <div className="pp-personal__field">
      <div className="pp-personal__field-left">
        <span className="pp-personal__field-icon">{icon}</span>
        <span className="pp-personal__field-label">{label}</span>
      </div>
      <span className="pp-personal__field-value">{value}</span>
    </div>
  )
}

export default function PersonalInfoCard({ firstName, role }: PersonalInfoCardProps) {
  const { data } = useProfileData()

  const initials = data
    ? `${firstName[0] ?? ''}${data.last_name[0] ?? ''}`.toUpperCase()
    : (firstName[0]?.toUpperCase() ?? '?')

  const showLicense = role === 'PHYSIOTHERAPIST' || role === 'FITNESS_TRAINER'

  return (
    <div className="pp-card">
      <div className="pp-personal__hero">
        <div className="pp-personal__avatar">{initials}</div>
        <div className="pp-personal__hero-info">
          <span className="pp-personal__name">{firstName} {data?.last_name ?? ''}</span>
          <Badge className="pp-personal__role-badge">{ROLE_LABELS[role]}</Badge>
        </div>
      </div>

      <div className="pp-personal__fields">
        <InfoField icon={<Mail size={16} />} label="Email" value={data?.email ?? '—'} />
        <InfoField icon={<Phone size={16} />} label="Phone" value={data?.phone ?? '—'} />
        <InfoField
          icon={<Calendar size={16} />}
          label="Date of Birth"
          value={data?.birth_date ? formatBirthDate(data.birth_date) : '—'}
        />
        {showLicense && (
          <InfoField
            icon={<BadgeCheck size={16} />}
            label="License Number"
            value={data?.license_number ?? '—'}
          />
        )}
      </div>
    </div>
  )
}
