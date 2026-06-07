import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react'
import { useAtomValue } from 'jotai'
import TopNav from '@/components/TopNav'
import { useVisitSummaries, useVisitSummary } from '@/hooks/useVisitSummaries'
import { useResolvedPatientId } from '@/hooks/useResolvedPatientId'
import { patientDetailPath, newVisitSummaryPath, visitSummaryDetailPath } from '@/lib/patientRoutes'
import { authAtom } from '@/store/authAtom'
import type { SessionListItem } from '@/types'

import '../patient-details/PatientDetails.css'
import './AllVisitSummaries.css'

type VisitType = 'Physical Therapy' | 'Training'
type FilterTab = 'All Sessions' | VisitType

const FILTER_TABS: FilterTab[] = ['All Sessions', 'Physical Therapy', 'Training']

function apiVisitTypeToLabel(apiType: string): VisitType {
  return apiType === 'FITNESS' ? 'Training' : 'Physical Therapy'
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
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(time: string): string {
  // time arrives as "HH:MM:SS" from backend — display as "HH:MM"
  return time.slice(0, 5)
}

interface VisitCardProps {
  session: SessionListItem
  onClick: () => void
}

function VisitCard({ session, onClick }: VisitCardProps) {
  const visitType = apiVisitTypeToLabel(session.visit_type)
  const isPhysicalTherapy = visitType === 'Physical Therapy'

  return (
    <div
      className="avs-visit-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      {/* Left: date/time */}
      <div className="avs-visit-card__left">
        <p className="avs-visit-card__date">{formatDate(session.visit_date)}</p>
        <p className="avs-visit-card__time">{formatTime(session.visit_time)}</p>
      </div>

      {/* Center: badge + therapist + treatmentArea + diagnosis + description */}
      <div className="avs-visit-card__center">
        <div className="avs-visit-card__top-row">
          <span className={`avs-visit-card__badge ${isPhysicalTherapy ? 'avs-visit-card__badge--pt' : 'avs-visit-card__badge--training'}`}>
            {visitType}
          </span>
          <span className="avs-visit-card__therapist">
            {session.therapist_first_name} {session.therapist_last_name}
          </span>
        </div>
        <p className="avs-visit-card__focus">{session.treatment_area}</p>
        {session.medical_diagnosis && (
          <p className="avs-visit-card__diagnosis">Diagnosis: {session.medical_diagnosis}</p>
        )}
        <p className="avs-visit-card__note">{session.description}</p>
      </div>

      {/* Right: chevron */}
      <div className="avs-visit-card__right">
        <ChevronRight size={18} />
      </div>
    </div>
  )
}

export default function AllVisitSummaries() {
  const navigate = useNavigate()
  const resolvedPatientId = useResolvedPatientId()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All Sessions')

  const auth = useAtomValue(authAtom)
  const canCreateSummary = auth?.role === 'PHYSIOTHERAPIST' || auth?.role === 'FITNESS_TRAINER'

  const { data: patient, isLoading: isPatientLoading, isError: isPatientError } = useVisitSummary(resolvedPatientId)
  const { data: sessions, isLoading, isError } = useVisitSummaries(resolvedPatientId)

  const age = patient?.birth_date ? calculateAge(patient.birth_date) : null

  const filteredSessions = (sessions ?? []).filter((s) => {
    if (activeFilter === 'All Sessions') return true
    return apiVisitTypeToLabel(s.visit_type) === activeFilter
  })

  return (
    <div className="avs-page">
      <TopNav />
      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => {
            if (!auth?.role || !resolvedPatientId) { navigate(-1); return }
            navigate(patientDetailPath(auth.role, resolvedPatientId))
          }}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Visit Summaries</h1>
        </div>

        {/* ── Body ── */}
        <div className="avs-body">
          {/* Patient Info Card */}
          {isPatientLoading && <p className="avs-empty">Loading patient…</p>}
          {isPatientError && (
            <p className="avs-empty" style={{ color: 'var(--color-error, #e53e3e)' }}>
              Failed to load patient details.
            </p>
          )}
          {!isPatientLoading && !isPatientError && patient && (
            <div className="patient-profile-card">
              <div className="patient-profile-card__avatar">
                {getInitials(patient.patient_first_name, patient.patient_last_name)}
              </div>
              <div className="patient-profile-card__info">
                <p className="patient-profile-card__name">
                  {patient.patient_first_name} {patient.patient_last_name}
                </p>
                <div className="patient-profile-card__meta-row">
                  <span>ID: #{resolvedPatientId}</span>
                  {age !== null && (
                    <>
                      <span className="patient-profile-card__sep">|</span>
                      <span>{age} years old</span>
                    </>
                  )}
                  {patient.phone && (
                    <>
                      <span className="patient-profile-card__sep">|</span>
                      <a href={`tel:${patient.phone}`} className="patient-profile-card__contact">
                        <Phone size={13} className="patient-profile-card__contact-icon" />
                        {patient.phone}
                      </a>
                    </>
                  )}
                  {patient.email && (
                    <>
                      <span className="patient-profile-card__sep">|</span>
                      <a href={`mailto:${patient.email}`} className="patient-profile-card__contact">
                        <Mail size={13} className="patient-profile-card__contact-icon" />
                        {patient.email}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Control bar: filters + new summary ── */}
          <div className="avs-control-bar">
            <div className="avs-filter-tabs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`avs-filter-tab${activeFilter === tab ? ' avs-filter-tab--active' : ''}`}
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {canCreateSummary && (
              <button
                type="button"
                className="avs-new-btn"
                onClick={() => {
                  if (!auth?.role || !resolvedPatientId) { navigate(-1); return }
                  navigate(newVisitSummaryPath(auth.role, resolvedPatientId))
                }}
              >
                <span className="avs-new-btn__icon">+</span>
                New Summary
              </button>
            )}
          </div>

          {/* ── Visit cards list ── */}
          <div className="avs-list">
            {isLoading && (
              <p className="avs-empty">Loading sessions…</p>
            )}
            {isError && (
              <p className="avs-empty" style={{ color: 'var(--color-error, #e53e3e)' }}>
                Failed to load sessions. Please try again.
              </p>
            )}
            {!isLoading && !isError && filteredSessions.length === 0 && (
              <p className="avs-empty">No sessions found for this filter.</p>
            )}
            {!isLoading && !isError && filteredSessions.map((session) => (
              <VisitCard
                key={session.session_id}
                session={session}
                onClick={() => {
                  if (!auth?.role || !resolvedPatientId) { navigate(-1); return }
                  navigate(visitSummaryDetailPath(auth.role, resolvedPatientId, session.session_id))
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
