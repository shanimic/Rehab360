import { useAtomValue } from 'jotai'
import { ChevronLeft, Phone, Mail, Calendar, User, Activity } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import InfoCard from '@/components/InfoCard'
import TopNav from '@/components/TopNav'

import ProgressBar from '@/components/ui/progress-bar'
import { usePatientDetails } from '@/hooks/usePatientDetails'
import { authAtom } from '@/store/authAtom'
import './PatientDetails.css'

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
  const auth = useAtomValue(authAtom)
  const { data, isLoading, isError } = usePatientDetails(routePatientId)

  const pageTitle = auth?.role === 'PATIENT' ? 'My Process' : 'Patient Details'

  if (isLoading) {
    return (
      <div className="patient-page">
        <TopNav />
        <main className="pt-16">
          <div className="patient-body">
            <p className="patient-empty-state">Loading patient data…</p>
          </div>
        </main>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="patient-page">
        <TopNav />
        <main className="pt-16">
          <div className="patient-body">
            <p className="patient-empty-state patient-empty-state--error">
              Failed to load patient data. Please try again.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const { patient, latest_visit_summary, treatment_plan, fitness_plan } = data
  const age = calculateAge(patient.birth_date)

  return (
    <div className="patient-page">
      <TopNav />
      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => navigate(`/patient/${routePatientId}`)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">{pageTitle}</h1>
        </div>

        {/* ── Body ── */}
        <div className="patient-body">
          {/* Profile header */}
          <div className="patient-profile-card">
            <div className="patient-profile-card__avatar">
              {getInitials(patient.first_name, patient.last_name)}
            </div>
            <div className="patient-profile-card__info">
              <p className="patient-profile-card__name">
                {patient.first_name} {patient.last_name}
              </p>
              <div className="patient-profile-card__meta-row">
                <span>ID: #{patient.user_id}</span>
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

          {/* Three main cards */}
          <div className="patient-cards-grid">
            {/* Visit Summaries */}
            <InfoCard
              title="Visit Summaries"
              actionLabel="View All Summaries"
              onAction={() => navigate(`/patient/${routePatientId}/visit-summaries`)}
            >
              {latest_visit_summary ? (
                <>
                  <div className="patient-visit__rows">
                    <div className="patient-visit__row">
                      <span className="patient-visit__label">
                        <Calendar size={14} />
                        Last Visit
                      </span>
                      <span className="patient-visit__value">
                        {formatDate(latest_visit_summary.visit_date)}
                      </span>
                    </div>
                    <div className="patient-visit__row">
                      <span className="patient-visit__label">
                        <User size={14} />
                        Therapist
                      </span>
                      <span className="patient-visit__value">
                        {latest_visit_summary.therapist_name}
                      </span>
                    </div>
                  </div>
                  <div className="patient-visit__note">
                    <span className="patient-visit__note-label">Clinical Note</span>
                    <p className="patient-visit__note-text">
                      {latest_visit_summary.description ?? 'No notes recorded.'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="patient-empty-state">No visit summary on record.</p>
              )}
            </InfoCard>

            {/* Treatment Plan */}
            <InfoCard
              title="Treatment Plan"
              actionLabel={treatment_plan ? 'Go to Current Treatment Plan' : undefined}
              onAction={
                treatment_plan
                  ? () => navigate(`/patient/${routePatientId}/treatment-plans/${treatment_plan.plan_id}`)
                  : undefined
              }
            >
              {treatment_plan ? (
                <>
                  <div className="patient-plan__rows">
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Activity size={14} />
                        Diagnosis
                      </span>
                      <span className="patient-plan__value">{treatment_plan.medical_diagnosis}</span>
                    </div>
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Calendar size={14} />
                        Start Date
                      </span>
                      <span className="patient-plan__value">{formatDate(treatment_plan.start_date)}</span>
                    </div>
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Calendar size={14} />
                        End Date
                      </span>
                      <span className="patient-plan__value">{formatDate(treatment_plan.end_date)}</span>
                    </div>
                  </div>
                  <div className="patient-plan__progress">
                    <ProgressBar value={Math.round(treatment_plan.progress_percentage)} showLabel />
                  </div>
                </>
              ) : (
                <p className="patient-empty-state">No active treatment plan.</p>
              )}
            </InfoCard>

            {/* Fitness Plan */}
            <InfoCard
              title="Fitness Plan"
              actionLabel={fitness_plan ? 'Go to Current Fitness Plan' : undefined}
              onAction={
                fitness_plan
                  ? () => navigate(`/patient/${routePatientId}/treatment-plans/${fitness_plan.plan_id}`)
                  : undefined
              }
            >
              {fitness_plan ? (
                <>
                  <div className="patient-plan__rows">
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Activity size={14} />
                        Diagnosis
                      </span>
                      <span className="patient-plan__value">{fitness_plan.medical_diagnosis}</span>
                    </div>
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Calendar size={14} />
                        Start Date
                      </span>
                      <span className="patient-plan__value">{formatDate(fitness_plan.start_date)}</span>
                    </div>
                    <div className="patient-plan__row">
                      <span className="patient-plan__label">
                        <Calendar size={14} />
                        End Date
                      </span>
                      <span className="patient-plan__value">{formatDate(fitness_plan.end_date)}</span>
                    </div>
                  </div>
                  <div className="patient-plan__progress">
                    <ProgressBar value={Math.round(fitness_plan.progress_percentage)} showLabel />
                  </div>
                </>
              ) : (
                <p className="patient-empty-state">No active fitness plan.</p>
              )}
            </InfoCard>
          </div>
        </div>
      </main>
    </div>
  )
}
