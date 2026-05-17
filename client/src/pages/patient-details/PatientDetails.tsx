import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Phone, Mail, Calendar, User, Activity } from 'lucide-react'
import TopNav from '@/components/TopNav'
import InfoCard from '@/components/InfoCard'
import ProgressBar from '@/components/ui/progress-bar'
import type { Plan, VisitSummary } from '@/types/patient'
import './PatientDetails.css'

interface PatientInfo {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
  email: string
}

interface MockData {
  patient: PatientInfo
  visitSummary: VisitSummary
  treatmentPlan: Plan
  trainingPlan: Plan
}

const MOCK: MockData = {
  patient: {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1981-03-15',
    phone: '+972-50-000-0001',
    email: 'john.smith@example.com',
  },
  alerts: [
    { id: 'a1', patientId: '1', type: 'warning', message: 'Missed last session — please reschedule.' },
  ],
  visitSummary: {
    date: '2026-03-28',
    therapistName: 'Dr. Liran Cohen',
    noteSnippet: 'Patient reports reduced pain in left shoulder after last session.',
  },
  treatmentPlan: {
    name: 'Shoulder Rehab',
    condition: 'Shoulder Rehabilitation',
    startDate: 'Jan 1, 2025',
    endDate: 'Jan 31, 2025',
    progressPercent: 78,
    nextSession: 'Tomorrow, 10:00 AM',
  },
  trainingPlan: {
    name: 'Strength Recovery',
    condition: 'Shoulder Rehabilitation',
    startDate: 'Jan 1, 2025',
    endDate: 'Jan 31, 2025',
    progressPercent: 45,
    nextSession: 'Tomorrow, 10:00 AM',
  },
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

export default function PatientDetails() {
  const navigate = useNavigate()
  const { id: routePatientId } = useParams<{ id: string }>()
  const [showTrainingComingSoon, setShowTrainingComingSoon] = useState(false)
  const { patient, alerts, visitSummary, treatmentPlan, trainingPlan } = MOCK

  console.log('[DEBUG] PatientDetails route param id:', routePatientId)

  const patientAlerts = alerts.filter((a) => a.patientId === patient.id)
  const age = calculateAge(patient.birthDate)

  return (
    <div className="patient-page">
      <TopNav />
      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Patient Details</h1>
        </div>

        {/* ── Body ── */}
        <div className="patient-body">
          {/* Profile header card */}
          <div className="patient-profile-card">
            <div className="patient-profile-card__avatar">
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            <div className="patient-profile-card__info">
              <p className="patient-profile-card__name">
                {patient.firstName} {patient.lastName}
              </p>
              <div className="patient-profile-card__meta-row">
                <span>ID: #{patient.id}</span>
                <span className="patient-profile-card__sep">|</span>
                <span>{age} years old</span>
                <span className="patient-profile-card__sep">|</span>
                <a href={`tel:${patient.phone}`} className="patient-profile-card__contact">
                  <Phone size={13} className="patient-profile-card__contact-icon" />
                  {patient.phone}
                </a>
                <span className="patient-profile-card__sep">|</span>
                <a href={`mailto:${patient.email}`} className="patient-profile-card__contact">
                  <Mail size={13} className="patient-profile-card__contact-icon" />
                  {patient.email}
                </a>
              </div>
            </div>
          </div>

          {/* Priority alerts — filtered for this patient */}
          {patientAlerts.length > 0 && (
            <section className="patient-alerts">
              <h2 className="patient-alerts__heading">Priority Alerts</h2>
              <div className="patient-alerts__list">
                {patientAlerts.map((alert) => (
                  <AlertCard key={alert.id} type={alert.type} message={alert.message} />
                ))}
              </div>
            </section>
          )}

          {/* Three main cards */}
          <div className="patient-cards-grid">
            {/* Visit Summaries */}
            <InfoCard title="Visit Summaries" actionLabel="View All Summaries" onAction={() => navigate(`/patient/${routePatientId}/visit-summaries`)}>
              <div className="patient-visit__rows">
                <div className="patient-visit__row">
                  <span className="patient-visit__label">
                    <Calendar size={14} />
                    Last Visit
                  </span>
                  <span className="patient-visit__value">{formatDate(visitSummary.date)}</span>
                </div>
                <div className="patient-visit__row">
                  <span className="patient-visit__label">
                    <User size={14} />
                    Therapist
                  </span>
                  <span className="patient-visit__value">{visitSummary.therapistName}</span>
                </div>
              </div>
              <div className="patient-visit__note">
                <span className="patient-visit__note-label">Clinical Note</span>
                <p className="patient-visit__note-text">{visitSummary.noteSnippet}</p>
              </div>
            </InfoCard>

            {/* Treatment Plan */}
            <InfoCard
              title="Treatment Plan"
              actionLabel="Go to Current Treatment Plan"
              onAction={() => navigate(`/patient/${routePatientId}/treatment-plans`)}
            >
              <div className="patient-plan__rows">
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Activity size={14} />
                    Plan
                  </span>
                  <span className="patient-plan__value">{treatmentPlan.name}</span>
                </div>
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Calendar size={14} />
                    Start Date
                  </span>
                  <span className="patient-plan__value">{treatmentPlan.startDate}</span>
                </div>
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Calendar size={14} />
                    End Date
                  </span>
                  <span className="patient-plan__value">{treatmentPlan.endDate}</span>
                </div>
              </div>
              <div className="patient-plan__progress">
                <ProgressBar value={treatmentPlan.progressPercent} showLabel />
              </div>
            </InfoCard>

            {/* Training Plan */}
            <InfoCard
              title="Training Plan"
              actionLabel="Go to Current Training Plan"
              onAction={() => {
                setShowTrainingComingSoon(true)
                setTimeout(() => setShowTrainingComingSoon(false), 3000)
              }}
            >
              <div className="patient-plan__rows">
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Activity size={14} />
                    Plan
                  </span>
                  <span className="patient-plan__value">{trainingPlan.name}</span>
                </div>
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Calendar size={14} />
                    Start Date
                  </span>
                  <span className="patient-plan__value">{trainingPlan.startDate}</span>
                </div>
                <div className="patient-plan__row">
                  <span className="patient-plan__label">
                    <Calendar size={14} />
                    End Date
                  </span>
                  <span className="patient-plan__value">{trainingPlan.endDate}</span>
                </div>
              </div>
              <div className="patient-plan__progress">
                <ProgressBar value={trainingPlan.progressPercent} showLabel />
              </div>
            </InfoCard>

            {showTrainingComingSoon && (
              <div className="patient-coming-soon">
                Fitness Plan view is coming soon
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
