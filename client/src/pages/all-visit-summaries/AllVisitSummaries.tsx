import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react'
import TopNav from '@/components/TopNav'

import '../patient-details/PatientDetails.css'
import './AllVisitSummaries.css'

type VisitType = 'Physical Therapy' | 'Training'
type FilterTab = 'All Sessions' | VisitType

interface VisitEntry {
  id: string
  sessionNumber: number
  visitDate: string
  visitTime: string
  visitType: VisitType
  therapistName: string
  treatmentArea: string
  medicalDiagnosis?: string
  description: string
}

const PATIENT = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1981-03-15',
  phone: '+972-50-000-0001',
  email: 'john.smith@example.com',
}

const MOCK_VISITS: VisitEntry[] = [
  {
    id: 'v3',
    sessionNumber: 3,
    visitDate: '2025-01-10',
    visitTime: '10:00 AM',
    visitType: 'Physical Therapy',
    therapistName: 'Dr. Liran Cohen',
    treatmentArea: 'Rotator Cuff Strengthening',
    medicalDiagnosis: 'Rotator Cuff Tear',
    description: 'Continued resistance exercises. Pain level reduced to 2/10.',
  },
  {
    id: 'v2',
    sessionNumber: 2,
    visitDate: '2025-01-08',
    visitTime: '10:00 AM',
    visitType: 'Training',
    therapistName: 'Alex Trainer',
    treatmentArea: 'Progress Evaluation',
    medicalDiagnosis: 'Shoulder Impingement',
    description: 'Mid-program assessment. Patient meets all milestones.',
  },
  {
    id: 'v1',
    sessionNumber: 1,
    visitDate: '2025-01-06',
    visitTime: '10:00 AM',
    visitType: 'Physical Therapy',
    therapistName: 'Dr. Liran Cohen',
    treatmentArea: 'Range of Motion Exercises',
    description: 'Good compliance with home exercises.',
  },
]

const FILTER_TABS: FilterTab[] = ['All Sessions', 'Physical Therapy', 'Training']

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

interface VisitCardProps {
  visit: VisitEntry
  onClick: () => void
}

function VisitCard({ visit, onClick }: VisitCardProps) {
  const isPhysicalTherapy = visit.visitType === 'Physical Therapy'

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
        <p className="avs-visit-card__session">Session {visit.sessionNumber}</p>
        <p className="avs-visit-card__date">{formatDate(visit.visitDate)}</p>
        <p className="avs-visit-card__time">{visit.visitTime}</p>
      </div>

      {/* Center: badge + therapist + treatmentArea + diagnosis + description */}
      <div className="avs-visit-card__center">
        <div className="avs-visit-card__top-row">
          <span className={`avs-visit-card__badge ${isPhysicalTherapy ? 'avs-visit-card__badge--pt' : 'avs-visit-card__badge--training'}`}>
            {visit.visitType}
          </span>
          <span className="avs-visit-card__therapist">{visit.therapistName}</span>
        </div>
        <p className="avs-visit-card__focus">{visit.treatmentArea}</p>
        {visit.medicalDiagnosis && (
          <p className="avs-visit-card__diagnosis">Diagnosis: {visit.medicalDiagnosis}</p>
        )}
        <p className="avs-visit-card__note">{visit.description}</p>
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
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All Sessions')

  const age = calculateAge(PATIENT.birthDate)

  const filteredVisits = activeFilter === 'All Sessions'
    ? MOCK_VISITS
    : MOCK_VISITS.filter((v) => v.visitType === activeFilter)

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
                <span>ID: #{PATIENT.id}</span>
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
              onClick={() => navigate(`/patient/${PATIENT.id}/visit-summaries/new`)}
            >
              <span className="avs-new-btn__icon">+</span>
              New Summary
            </button>
          </div>

          {/* ── Visit cards list ── */}
          <div className="avs-list">
            {filteredVisits.length === 0 ? (
              <p className="avs-empty">No sessions found for this filter.</p>
            ) : (
              filteredVisits.map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onClick={() => navigate(`/patient/${PATIENT.id}/visit-summaries/${visit.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
