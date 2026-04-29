import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Phone, Mail, CalendarDays, Stethoscope, ArrowRight } from 'lucide-react'
import TopNav from '@/components/TopNav'
import { useVisitSummaryDetail } from '@/hooks/useVisitSummaries'
import type { VisitSummaryDetails } from '@/types'

import '../patient-details/PatientDetails.css'
import './VisitSummaryDetail.css'

const VISIT_TYPE_LABEL: Record<string, string> = {
  PHYSIOTHERAPIST: 'Physical Therapy',
  FITNESS: 'Fitness Training',
}

const THERAPIST_ROLE_LABEL: Record<string, string> = {
  PHYSIOTHERAPIST: 'Physiotherapist',
  FITNESS_TRAINER: 'Fitness Trainer',
}

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(timeStr: string): string {
  const [hoursStr, minutesStr] = timeStr.split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface VisitInfoCardProps {
  visit: VisitSummaryDetails
  onOpenPlan: (() => void) | null
}

function VisitInfoCard({ visit, onOpenPlan }: VisitInfoCardProps) {
  const isPT = visit.visit_type === 'PHYSIOTHERAPIST'
  const visitTypeLabel = VISIT_TYPE_LABEL[visit.visit_type] ?? visit.visit_type
  const therapistRole = THERAPIST_ROLE_LABEL[visit.therapist_role] ?? visit.therapist_role
  const therapistInitials = `${visit.therapist_first_name[0]}${visit.therapist_last_name[0]}`.toUpperCase()

  return (
    <div className="vsd-card">
      <div className="vsd-card__header">
        <CalendarDays size={18} className="vsd-card__icon" />
        <h2 className="vsd-card__title">Visit Details</h2>
      </div>

      <div className="vsd-detail-grid">
        <span className="vsd-detail-grid__label">Session</span>
        <span className="vsd-detail-grid__value">#{visit.session_id}</span>

        <span className="vsd-detail-grid__label">Date</span>
        <span className="vsd-detail-grid__value">{formatDate(visit.visit_date)}</span>

        <span className="vsd-detail-grid__label">Time</span>
        <span className="vsd-detail-grid__value">{formatTime(visit.visit_time)}</span>

        <span className="vsd-detail-grid__label">Visit Type</span>
        <span className={`vsd-badge ${isPT ? 'vsd-badge--pt' : 'vsd-badge--training'}`}>
          {visitTypeLabel}
        </span>

        <span className="vsd-detail-grid__label">Treatment Area</span>
        <span className="vsd-detail-grid__value">{visit.treatment_area}</span>
      </div>

      <hr className="vsd-divider" />

      <div className="vsd-therapist">
        <div className="vsd-therapist__avatar">{therapistInitials}</div>
        <div className="vsd-therapist__info">
          <span className="vsd-therapist__name">
            {visit.therapist_first_name} {visit.therapist_last_name}
          </span>
          <span className="vsd-therapist__role">{therapistRole}</span>
        </div>
      </div>

      {onOpenPlan && (
        <div className="vsd-plan-action">
          <button type="button" className="vsd-plan-link" onClick={onOpenPlan}>
            Open Treatment Plan
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

interface MedicalCardProps {
  visit: VisitSummaryDetails
}

function MedicalCard({ visit }: MedicalCardProps) {
  return (
    <div className="vsd-card">
      <div className="vsd-card__header">
        <Stethoscope size={18} className="vsd-card__icon" />
        <h2 className="vsd-card__title">Medical Content</h2>
      </div>

      <div className="vsd-fields">
        <div className="vsd-field-block">
          <span className="vsd-field-block__label">Diagnosis</span>
          <p className="vsd-field-block__text">{visit.medical_diagnosis}</p>
        </div>

        <div className="vsd-field-block vsd-field-block--accent">
          <span className="vsd-field-block__label">Visit Notes</span>
          <p className="vsd-field-block__text">{visit.description}</p>
        </div>

        {visit.recommendations && (
          <div className="vsd-field-block vsd-field-block--accent">
            <span className="vsd-field-block__label">Recommendations</span>
            <p className="vsd-field-block__text">{visit.recommendations}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function PageShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="vsd-page">
      <TopNav doctorName="Cohen" />
      <main className="pt-16">
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Visit Summary</h1>
        </div>
        <div className="vsd-body">{children}</div>
      </main>
    </div>
  )
}

export default function VisitSummaryDetail() {
  const navigate = useNavigate()
  const { id, visitId } = useParams<{ id: string; visitId: string }>()
  const sessionId = Number(visitId)

  const { data, isLoading, isError } = useVisitSummaryDetail(
    Number.isNaN(sessionId) ? undefined : sessionId,
  )

  const toList = (patientId: string | undefined) =>
    `/patient/${patientId ?? id ?? ''}/visit-summaries`

  useEffect(() => {
    if (Number.isNaN(sessionId)) navigate(`/patient/${id ?? ''}/visit-summaries`)
  }, [sessionId, id, navigate])

  if (Number.isNaN(sessionId)) return null

  if (isLoading) {
    return (
      <PageShell onBack={() => navigate(toList(undefined))}>
        <p className="vsd-state-text">Loading...</p>
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell onBack={() => navigate(toList(undefined))}>
        <p className="vsd-state-text vsd-state-text--error">
          Could not load visit summary. Please try again.
        </p>
      </PageShell>
    )
  }

  const age = data.birth_date ? calculateAge(data.birth_date) : null
  const onOpenPlan =
    typeof data.plan_id === 'number'
      ? () => navigate(`/patient/${data.patient_id}/treatment-plans/${data.plan_id}`)
      : null

  return (
    <PageShell onBack={() => navigate(toList(data.patient_id))}>
      {/* Patient Info Card */}
      <div className="patient-profile-card">
        <div className="patient-profile-card__avatar">
          {getInitials(data.patient_first_name, data.patient_last_name)}
        </div>
        <div className="patient-profile-card__info">
          <p className="patient-profile-card__name">
            {data.patient_first_name} {data.patient_last_name}
          </p>
          <div className="patient-profile-card__meta-row">
            <span>ID: #{data.patient_id}</span>
            {age !== null && (
              <>
                <span className="patient-profile-card__sep">|</span>
                <span>{age} years old</span>
              </>
            )}
            {data.phone && (
              <>
                <span className="patient-profile-card__sep">|</span>
                <a href={`tel:${data.phone}`} className="patient-profile-card__contact">
                  <Phone size={13} className="patient-profile-card__contact-icon" />
                  {data.phone}
                </a>
              </>
            )}
            {data.email && (
              <>
                <span className="patient-profile-card__sep">|</span>
                <a href={`mailto:${data.email}`} className="patient-profile-card__contact">
                  <Mail size={13} className="patient-profile-card__contact-icon" />
                  {data.email}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <VisitInfoCard visit={data} onOpenPlan={onOpenPlan} />
      <MedicalCard visit={data} />
    </PageShell>
  )
}
