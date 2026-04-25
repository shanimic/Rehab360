import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react'
import TopNav from '@/components/TopNav'
import { useVisitSummaries } from '@/hooks/useVisitSummaries'
import type { SessionListItem } from '@/types'

import '../patient-details/PatientDetails.css'
import './AllVisitSummaries.css'

type VisitType = 'Physical Therapy' | 'Training'
type FilterTab = 'All Sessions' | VisitType

const PATIENT = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1981-03-15',
  phone: '+972-50-000-0001',
  email: 'john.smith@example.com',
}

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
  sessionNumber: number
  onClick: () => void
}

function VisitCard({ session, sessionNumber, onClick }: VisitCardProps) {
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
      {/* Left: session number + date/time */}
      <div className="avs-visit-card__left">
        <p className="avs-visit-card__session">Session {sessionNumber}</p>
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
  const { id } = useParams<{ id: string }>()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All Sessions')

  const { data: sessions, isLoading, isError } = useVisitSummaries(id)

  console.log('[DEBUG] AllVisitSummaries GET /visit-summary/sessions response:', sessions)

  const age = calculateAge(PATIENT.birthDate)

  const filteredSessions = (sessions ?? []).filter((s) => {
    if (activeFilter === 'All Sessions') return true
    return apiVisitTypeToLabel(s.visit_type) === activeFilter
  })

  // Oldest session is #1, newest is #N
  const totalCount = sessions?.length ?? 0

  return (
    <div className="avs-page">
      <TopNav doctorName="Cohen" />
      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Visit Summaries</h1>
        </div>

        {/* ── Body ── */}
        <div className="avs-body">
          {/* Patient Info Card — identical to PatientDetails */}
          <div className="patient-profile-card">
            <div className="patient-profile-card__avatar">
              {getInitials(PATIENT.firstName, PATIENT.lastName)}
            </div>
            <div className="patient-profile-card__info">
              <p className="patient-profile-card__name">
                {PATIENT.firstName} {PATIENT.lastName}
              </p>
              <div className="patient-profile-card__meta-row">
                <span>ID: #{id}</span>
                <span className="patient-profile-card__sep">|</span>
                <span>{age} years old</span>
                <span className="patient-profile-card__sep">|</span>
                <a href={`tel:${PATIENT.phone}`} className="patient-profile-card__contact">
                  <Phone size={13} className="patient-profile-card__contact-icon" />
                  {PATIENT.phone}
                </a>
                <span className="patient-profile-card__sep">|</span>
                <a href={`mailto:${PATIENT.email}`} className="patient-profile-card__contact">
                  <Mail size={13} className="patient-profile-card__contact-icon" />
                  {PATIENT.email}
                </a>
              </div>
            </div>
          </div>

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
            <button
              type="button"
              className="avs-new-btn"
              onClick={() => {
                console.log('[DEBUG] AllVisitSummaries navigating to new visit, id:', id)
                navigate(`/patient/${id}/visit-summaries/new`)
              }}
            >
              <span className="avs-new-btn__icon">+</span>
              New Summary
            </button>
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
            {!isLoading && !isError && filteredSessions.map((session, index) => (
              <VisitCard
                key={session.session_id}
                session={session}
                sessionNumber={totalCount - index}
                onClick={() => navigate(`/patient/${id}/visit-summaries/${session.session_id}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
