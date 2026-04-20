import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Phone, Mail, Target, ClipboardList, CheckCircle2 } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'

import '../patient-details/PatientDetails.css'
import './CreateVisitSummary.css'

// ── Mock patient data (mirrors AllVisitSummaries) ────────────────────────────
const PATIENT = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  birthDate: '1981-03-15',
  phone: '+972-50-000-0001',
  email: 'john.smith@example.com',
}

// ── Mock rehabilitation goal ─────────────────────────────────────────────────
const REHAB_GOAL = {
  title: 'Full shoulder range of motion recovery',
  progressPercent: 42,
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getCurrentTimeString(): string {
  return new Date().toTimeString().slice(0, 5)
}

// ── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  date: string
  time: string
  treatmentArea: string
  medicalDiagnosis: string
  visitNotes: string
  recommendations: string
}

interface FormErrors {
  date?: string
  time?: string
  treatmentArea?: string
  visitNotes?: string
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CreateVisitSummary() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const auth = useAtomValue(authAtom)

  // Plan data returned from CreateTreatmentPlan (draft = "Back" clicked, saved = "Save" clicked)
  type PlanState = { goal: string; start_date: string; end_date: string; notes: string }
  const locationState = location.state as { plan_data?: PlanState; saved_plan?: PlanState } | null
  const planDraft = locationState?.plan_data ?? null
  const savedPlan = locationState?.saved_plan ?? null

  // Derive session type from user role — not editable
  const isPhysicalTherapy = auth?.role !== 'FITNESS_TRAINER'
  const sessionType = isPhysicalTherapy ? 'Physical Therapy' : 'Training'

  const age = calculateAge(PATIENT.birthDate)

  const [form, setForm] = useState<FormState>({
    date: getTodayString(),
    time: getCurrentTimeString(),
    treatmentArea: '',
    medicalDiagnosis: '',
    visitNotes: '',
    recommendations: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(field: keyof FormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.time) newErrors.time = 'Time is required'
    if (!form.treatmentArea.trim()) newErrors.treatmentArea = 'Treatment area is required'
    if (!form.visitNotes.trim()) newErrors.visitNotes = 'Visit notes are required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSave(): void {
    if (!validate()) return
    setIsSaving(true)
    // Simulate async API call
    setTimeout(() => {
      setIsSaving(false)
      navigate(`/patient/${id ?? PATIENT.id}/visit-summaries`)
    }, 800)
  }

  function handleCancel(): void {
    navigate(`/patient/${id ?? PATIENT.id}/visit-summaries`)
  }

  // True once the user has saved a treatment plan in this session.
  // In production this would come from an API call (patient already has a plan record).
  const hasExistingPlan = savedPlan !== null

  // Case A — no existing plan: open a blank form
  function handleCreateNewPlan(): void {
    navigate('/create-treatment-plan', {
      state: {
        medical_diagnosis: form.medicalDiagnosis,
        patient_id: id ?? PATIENT.id,
        isUpdate: false,
        plan_data: undefined,
      },
    })
  }

  // Case B — plan exists: pre-fill with the saved data for editing
  function handleUpdatePlan(): void {
    navigate('/create-treatment-plan', {
      state: {
        medical_diagnosis: form.medicalDiagnosis,
        patient_id: id ?? PATIENT.id,
        isUpdate: true,
        plan_data: savedPlan ?? planDraft,
      },
    })
  }

  return (
    <div className="cvs-page">
      <TopNav doctorName={auth?.first_name ?? 'Cohen'} />

      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={handleCancel}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">New Visit Summary</h1>
        </div>

        {/* ── Single-column body ── */}
        <div className="cvs-body">

          {/* 1. Patient Profile Card */}
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

          {/* Session type badge — role-derived, single badge shown */}
          <div className="cvs-session-row">
            <span
              className={`cvs-session-badge ${isPhysicalTherapy ? 'cvs-session-badge--pt' : 'cvs-session-badge--training'}`}
            >
              {sessionType}
            </span>
          </div>

          {/* 2. Visit Details Card */}
          <div className="cvs-card">
            <h2 className="cvs-card__title">Visit Details</h2>

            <div className="cvs-form-row">
              <div className="cvs-field">
                <label className="cvs-label" htmlFor="cvs-date">
                  Date <span className="cvs-required">*</span>
                </label>
                <input
                  id="cvs-date"
                  type="date"
                  className={`cvs-input${errors.date ? ' cvs-input--error' : ''}`}
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
                {errors.date && <p className="cvs-error-msg">{errors.date}</p>}
              </div>

              <div className="cvs-field">
                <label className="cvs-label" htmlFor="cvs-time">
                  Time <span className="cvs-required">*</span>
                </label>
                <input
                  id="cvs-time"
                  type="time"
                  className={`cvs-input${errors.time ? ' cvs-input--error' : ''}`}
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
                {errors.time && <p className="cvs-error-msg">{errors.time}</p>}
              </div>
            </div>

            <div className="cvs-field">
              <label className="cvs-label" htmlFor="cvs-treatment-area">
                Treatment Area <span className="cvs-required">*</span>
              </label>
              <input
                id="cvs-treatment-area"
                type="text"
                className={`cvs-input${errors.treatmentArea ? ' cvs-input--error' : ''}`}
                placeholder="e.g. Rotator Cuff Strengthening"
                value={form.treatmentArea}
                onChange={(e) => handleChange('treatmentArea', e.target.value)}
              />
              {errors.treatmentArea && (
                <p className="cvs-error-msg">{errors.treatmentArea}</p>
              )}
            </div>

            <div className="cvs-field">
              <label className="cvs-label" htmlFor="cvs-diagnosis">
                Medical Diagnosis
              </label>
              <input
                id="cvs-diagnosis"
                type="text"
                className="cvs-input"
                placeholder="e.g. Rotator Cuff Tear"
                value={form.medicalDiagnosis}
                onChange={(e) => handleChange('medicalDiagnosis', e.target.value)}
              />
            </div>
          </div>

          {/* 3. Notes & Recommendations Card */}
          <div className="cvs-card">
            <h2 className="cvs-card__title">Notes &amp; Recommendations</h2>

            <div className="cvs-field">
              <label className="cvs-label" htmlFor="cvs-visit-notes">
                Visit Notes <span className="cvs-required">*</span>
              </label>
              <textarea
                id="cvs-visit-notes"
                className={`cvs-textarea${errors.visitNotes ? ' cvs-input--error' : ''}`}
                placeholder="Describe what happened during the visit, patient response, pain levels…"
                value={form.visitNotes}
                onChange={(e) => handleChange('visitNotes', e.target.value)}
                rows={5}
              />
              {errors.visitNotes && (
                <p className="cvs-error-msg">{errors.visitNotes}</p>
              )}
            </div>

            <div className="cvs-field">
              <label className="cvs-label" htmlFor="cvs-recommendations">
                Recommendations
              </label>
              <textarea
                id="cvs-recommendations"
                className="cvs-textarea"
                placeholder="Home exercises, precautions, next steps for the patient…"
                value={form.recommendations}
                onChange={(e) => handleChange('recommendations', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* 4. Rehabilitation Goal — shows saved treatment plan goal if available */}
          <div className="cvs-card cvs-card--goal">
            <div className="cvs-card__title-row">
              <Target size={16} className="cvs-card__title-icon" />
              <h2 className="cvs-card__title">
                {savedPlan ? 'Treatment Plan Goal' : 'Current Rehabilitation Goal'}
              </h2>
              {savedPlan && (
                <span className="cvs-plan-saved-badge">
                  <CheckCircle2 size={12} />
                  Plan Saved
                </span>
              )}
            </div>

            <p className="cvs-goal__text">
              {savedPlan ? savedPlan.goal : REHAB_GOAL.title}
            </p>

            {savedPlan ? (
              <p className="cvs-plan-dates">
                {savedPlan.start_date} &mdash; {savedPlan.end_date}
              </p>
            ) : (
              <div className="cvs-goal__progress">
                <div className="cvs-goal__progress-header">
                  <span className="cvs-goal__progress-label">Overall Progress</span>
                  <span className="cvs-goal__progress-pct">{REHAB_GOAL.progressPercent}%</span>
                </div>
                <div className="cvs-goal__progress-track">
                  <div
                    className="cvs-goal__progress-fill"
                    style={{ width: `${REHAB_GOAL.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Action Buttons */}
          <div className="cvs-actions">
            {/* Far left — tertiary */}
            <button
              type="button"
              className="cvs-btn-cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>

            {/* Far right — plan button(s) + primary save */}
            <div className="cvs-actions__right">
              {hasExistingPlan ? (
                <>
                  <button
                    type="button"
                    className="cvs-btn-plan"
                    disabled={isSaving}
                    onClick={handleCreateNewPlan}
                  >
                    <ClipboardList size={15} className="cvs-btn-plan__icon" />
                    Create New Plan
                  </button>
                  <button
                    type="button"
                    className="cvs-btn-plan"
                    disabled={isSaving}
                    onClick={handleUpdatePlan}
                  >
                    <ClipboardList size={15} className="cvs-btn-plan__icon" />
                    Update Current Plan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="cvs-btn-plan"
                  disabled={isSaving}
                  onClick={handleCreateNewPlan}
                >
                  <ClipboardList size={15} className="cvs-btn-plan__icon" />
                  Create Treatment Plan
                </button>
              )}
              <button
                type="button"
                className="cvs-btn-save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Summary'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
