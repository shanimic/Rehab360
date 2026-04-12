import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Phone, Mail, Target, CalendarDays, Stethoscope } from 'lucide-react'
import TopNav from '@/components/TopNav'

import '../patient-details/PatientDetails.css'
import './VisitSummaryDetail.css'

type VisitType = 'Physical Therapy' | 'Training'

interface VisitDetail {
  id: string
  visitDate: string
  visitTime: string
  visitType: VisitType
  therapistName: string
  professionalRole: string
  treatmentArea: string
  medicalDiagnosis?: string
  description: string
  recommendations?: string
  rehabGoal?: string
}

const REHAB_GOAL = {
  title: 'Full shoulder range of motion recovery',
  progressPercent: 42,
}

const PATIENT = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1981-03-15',
  phone: '+972-50-000-0001',
  email: 'john.smith@example.com',
}

const MOCK_VISITS: VisitDetail[] = [
  {
    id: 'v1',
    visitDate: '2025-01-06',
    visitTime: '10:00 AM',
    visitType: 'Physical Therapy',
    therapistName: 'Dr. Liran Cohen',
    professionalRole: 'Physiotherapist',
    treatmentArea: 'Range of Motion Exercises',
    medicalDiagnosis: 'Shoulder Impingement',
    description:
      'Initial session focused on baseline range-of-motion assessment. Patient reports pain level at 4/10. Good compliance with home exercises. Introduced basic pendulum exercises and passive stretching.',
    recommendations:
      'Perform pendulum exercises twice daily. Apply ice 15 minutes post-exercise. Avoid overhead activities until next session.',
    rehabGoal: 'Achieve 90+ degrees external rotation and return to pain-free daily activities within 8 weeks.',
  },
  {
    id: 'v2',
    visitDate: '2025-01-08',
    visitTime: '10:00 AM',
    visitType: 'Training',
    therapistName: 'Alex Trainer',
    professionalRole: 'Fitness Trainer',
    treatmentArea: 'Progress Evaluation',
    medicalDiagnosis: 'Shoulder Impingement',
    description:
      'Mid-program assessment. Patient meets all milestones set at intake. Strength testing shows 15% improvement in shoulder abductors. Patient is motivated and engaged.',
    recommendations:
      'Progress to resistance band exercises (Level 2). Continue aerobic conditioning 3x/week. Schedule follow-up in 2 days.',
    rehabGoal: 'Achieve 90+ degrees external rotation and return to pain-free daily activities within 8 weeks.',
  },
  {
    id: 'v3',
    visitDate: '2025-01-10',
    visitTime: '10:00 AM',
    visitType: 'Physical Therapy',
    therapistName: 'Dr. Liran Cohen',
    professionalRole: 'Physiotherapist',
    treatmentArea: 'Rotator Cuff Strengthening',
    medicalDiagnosis: 'Rotator Cuff Tear',
    description:
      'Patient demonstrated improved shoulder mobility with external rotation now reaching 85 degrees (up from 70 degrees last week). Completed full exercise protocol without significant pain. Patient reports pain level at 2/10, down from 4/10.',
    recommendations:
      'Continue current exercise program. Increase resistance band tension for external rotation exercises. Patient may begin light overhead activities. Schedule follow-up in 3 days.',
    rehabGoal: 'Achieve 90+ degrees external rotation and return to pain-free daily activities within 8 weeks.',
  },
]

// Sort oldest → newest to derive session numbers positionally
const VISITS_SORTED = [...MOCK_VISITS].sort(
  (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime(),
)

function getSessionNumber(visitId: string): number {
  const index = VISITS_SORTED.findIndex((v) => v.id === visitId)
  return index === -1 ? 1 : index + 1
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

function getProfessionalInitials(fullName: string): string {
  const parts = fullName.replace(/^Dr\.\s*/i, '').split(' ')
  return parts
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface VisitInfoCardProps {
  visit: VisitDetail
  sessionNumber: number
}

function VisitInfoCard({ visit, sessionNumber }: VisitInfoCardProps) {
  const isPT = visit.visitType === 'Physical Therapy'

  return (
    <div className="vsd-card">
      <div className="vsd-card__header">
        <CalendarDays size={18} className="vsd-card__icon" />
        <h2 className="vsd-card__title">Visit Details</h2>
      </div>

      <div className="vsd-detail-grid">
        <span className="vsd-detail-grid__label">Session</span>
        <span className="vsd-detail-grid__value">Session {sessionNumber}</span>

        <span className="vsd-detail-grid__label">Date</span>
        <span className="vsd-detail-grid__value">{formatDate(visit.visitDate)}</span>

        <span className="vsd-detail-grid__label">Time</span>
        <span className="vsd-detail-grid__value">{visit.visitTime}</span>

        <span className="vsd-detail-grid__label">Visit Type</span>
        <span className={`vsd-badge ${isPT ? 'vsd-badge--pt' : 'vsd-badge--training'}`}>
          {visit.visitType}
        </span>

        <span className="vsd-detail-grid__label">Treatment Area</span>
        <span className="vsd-detail-grid__value">{visit.treatmentArea}</span>
      </div>

      <hr className="vsd-divider" />

      <div className="vsd-therapist">
        <div className="vsd-therapist__avatar">
          {getProfessionalInitials(visit.therapistName)}
        </div>
        <div className="vsd-therapist__info">
          <span className="vsd-therapist__name">{visit.therapistName}</span>
          <span className="vsd-therapist__role">{visit.professionalRole}</span>
        </div>
      </div>
    </div>
  )
}

interface MedicalCardProps {
  visit: VisitDetail
}

function MedicalCard({ visit }: MedicalCardProps) {
  return (
    <div className="vsd-card">
      <div className="vsd-card__header">
        <Stethoscope size={18} className="vsd-card__icon" />
        <h2 className="vsd-card__title">Medical Content</h2>
      </div>

      <div className="vsd-fields">
        {visit.medicalDiagnosis && (
          <div className="vsd-field-block">
            <span className="vsd-field-block__label">Diagnosis</span>
            <p className="vsd-field-block__text">{visit.medicalDiagnosis}</p>
          </div>
        )}

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

function RehabGoalCard() {
  return (
    <div className="vsd-card vsd-card--goal">
      <div className="vsd-card__header">
        <Target size={18} className="vsd-card__icon" />
        <h2 className="vsd-card__title">Rehabilitation Goal</h2>
      </div>

      <div className="vsd-goal-content">
        <p className="vsd-goal-text">{REHAB_GOAL.title}</p>

        <div className="vsd-goal__progress">
          <div className="vsd-goal__progress-header">
            <span className="vsd-goal__progress-label">Overall Progress</span>
            <span className="vsd-goal__progress-pct">{REHAB_GOAL.progressPercent}%</span>
          </div>
          <div className="vsd-goal__progress-track">
            <div
              className="vsd-goal__progress-fill"
              style={{ width: `${REHAB_GOAL.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VisitSummaryDetail() {
  const navigate = useNavigate()
  const { visitId } = useParams<{ visitId: string }>()

  const visit = MOCK_VISITS.find((v) => v.id === visitId) ?? null

  useEffect(() => {
    if (!visit) {
      navigate(-1)
    }
  }, [visit, navigate])

  if (!visit) return null

  const age = calculateAge(PATIENT.birthDate)
  const sessionNumber = getSessionNumber(visit.id)

  return (
    <div className="vsd-page">
      <TopNav doctorName="Cohen" />
      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Visit Summary</h1>
        </div>

        {/* ── Body ── */}
        <div className="vsd-body">
          {/* Patient Info Card — identical markup to AllVisitSummaries */}
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

          {/* ── Two-column content grid ── */}
          <div className="vsd-content-grid">
            {/* Left column */}
            <div className="vsd-col-main">
              <VisitInfoCard visit={visit} sessionNumber={sessionNumber} />
              <MedicalCard visit={visit} />
            </div>

            {/* Right column */}
            <div className="vsd-col-side">
              <RehabGoalCard />
              <button type="button" className="vsd-plan-btn">
                View Treatment Plan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
