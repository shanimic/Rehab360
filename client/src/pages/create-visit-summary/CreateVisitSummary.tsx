import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Phone, Mail, ClipboardList } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import { useVisitSummary } from '@/hooks/useVisitSummaries'
import { useCreateVisitSummary } from '@/hooks/useCreateVisitSummary'

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
  medicalDiagnosis?: string
  visitNotes?: string
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CreateVisitSummary() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const auth = useAtomValue(authAtom)

  // ── Real API data (API-first, mock fallback) ─────────────────────────────
  const { data: patientApiData, isLoading: isLoadingPatient } = useVisitSummary(id)

  useEffect(() => {
    console.log('[DEBUG] Route param id (patient_id sent to API):', id)
  }, [id])

  useEffect(() => {
    if (patientApiData) {
      console.log('[DEBUG] useVisitSummary response:', patientApiData)
    }
  }, [patientApiData])

  const displayPatient = {
    id:        patientApiData?.patient_id        ?? PATIENT.id,
    firstName: patientApiData?.patient_first_name ?? PATIENT.firstName,
    lastName:  patientApiData?.patient_last_name  ?? PATIENT.lastName,
    birthDate: patientApiData?.birth_date         ?? PATIENT.birthDate,
    phone:     patientApiData?.phone              ?? PATIENT.phone,
    email:     patientApiData?.email              ?? PATIENT.email,
  }

  // Derive session type from user role — not editable
  const isPhysicalTherapy = auth?.role !== 'FITNESS_TRAINER'
  const sessionType = isPhysicalTherapy ? 'Physical Therapy' : 'Training'

  const age = calculateAge(displayPatient.birthDate)

  const [form, setForm] = useState<FormState>({
    date: getTodayString(),
    time: getCurrentTimeString(),
    treatmentArea: '',
    medicalDiagnosis: '',
    visitNotes: '',
    recommendations: '',
  })

  const createVisitSummary = useCreateVisitSummary()
  const isSaving = createVisitSummary.isPending

  const [errors, setErrors] = useState<FormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)

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
    if (!form.medicalDiagnosis.trim()) newErrors.medicalDiagnosis = 'Medical Diagnosis is required'
    if (!form.visitNotes.trim()) newErrors.visitNotes = 'Visit notes are required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function buildPayload() {
    const patientId = id ?? displayPatient.id
    return {
      patientId,
      payload: {
        visit_date: form.date,
        visit_time: form.time,
        treatment_area: form.treatmentArea,
        medical_diagnosis: form.medicalDiagnosis,
        description: form.visitNotes,
        recommendations: form.recommendations || undefined,
        patient_id: patientId,
        therapist_id: auth?.id ?? '',
        therapist_role: auth?.role ?? '',
      },
    }
  }

  // Save summary only — navigate to the list on success
  function handleSave(): void {
    if (!auth) { setSaveError('Session expired. Please log in again.'); return }
    if (!validate()) return
    setSaveError(null)
    const { patientId, payload } = buildPayload()
    console.log('[DEBUG] POST /visit-summary payload:', payload)
    createVisitSummary.mutate(payload, {
      onSuccess: (data) => {
        console.log('[DEBUG] Visit summary created, session_id:', data.session_id)
        console.log('[DEBUG] Navigating to:', `/patient/${patientId}/visit-summaries`)
        navigate(`/patient/${patientId}/visit-summaries`)
      },
      onError: (err) => {
        console.error('[DEBUG] Save failed:', err)
        setSaveError('Failed to save visit summary. Please try again.')
      },
    })
  }

  // Save summary first, then navigate to Create Treatment Plan with session_id
  function handleSaveAndCreatePlan(): void {
    if (!auth) { setSaveError('Session expired. Please log in again.'); return }
    if (!validate()) return
    setSaveError(null)
    const { patientId, payload } = buildPayload()
    console.log('[DEBUG] POST /visit-summary (save & plan) payload:', payload)
    createVisitSummary.mutate(payload, {
      onSuccess: (data) => {
        console.log('[DEBUG] Visit summary created, session_id:', data.session_id)
        console.log('[DEBUG] Navigating to /create-treatment-plan with session_id:', data.session_id)
        navigate('/create-treatment-plan', {
          state: {
            patient_id: patientId,
            session_id: data.session_id,
            medical_diagnosis: form.medicalDiagnosis,
          },
        })
      },
      onError: (err) => {
        console.error('[DEBUG] Save & create plan failed:', err)
        setSaveError('Failed to save visit summary. Please try again.')
      },
    })
  }

  function handleCancel(): void {
    navigate(`/patient/${id ?? displayPatient.id}/visit-summaries`)
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
            {isLoadingPatient ? (
              <p style={{ padding: '0.5rem', color: 'var(--color-primary)' }}>
                Loading patient data…
              </p>
            ) : (
              <>
                <div className="patient-profile-card__avatar">
                  {getInitials(displayPatient.firstName, displayPatient.lastName)}
                </div>
                <div className="patient-profile-card__info">
                  <p className="patient-profile-card__name">
                    {displayPatient.firstName} {displayPatient.lastName}
                  </p>
                  <div className="patient-profile-card__meta-row">
                    <span>ID: #{displayPatient.id}</span>
                    <span className="patient-profile-card__sep">|</span>
                    <span>{age} years old</span>
                    <span className="patient-profile-card__sep">|</span>
                    <a href={`tel:${displayPatient.phone}`} className="patient-profile-card__contact">
                      <Phone size={13} className="patient-profile-card__contact-icon" />
                      {displayPatient.phone}
                    </a>
                    <span className="patient-profile-card__sep">|</span>
                    <a href={`mailto:${displayPatient.email}`} className="patient-profile-card__contact">
                      <Mail size={13} className="patient-profile-card__contact-icon" />
                      {displayPatient.email}
                    </a>
                  </div>
                </div>
              </>
            )}
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
                Medical Diagnosis <span className="cvs-required">*</span>
              </label>
              <input
                id="cvs-diagnosis"
                type="text"
                className={`cvs-input${errors.medicalDiagnosis ? ' cvs-input--error' : ''}`}
                placeholder="e.g. Rotator Cuff Tear"
                value={form.medicalDiagnosis}
                onChange={(e) => handleChange('medicalDiagnosis', e.target.value)}
              />
              {errors.medicalDiagnosis && (
                <p className="cvs-error-msg">{errors.medicalDiagnosis}</p>
              )}
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

          {/* 4. Action Buttons */}
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

            {/* Far right — plan button + primary save */}
            <div className="cvs-actions__right">
              {saveError && (
                <p className="cvs-error-msg" style={{ alignSelf: 'center' }}>{saveError}</p>
              )}
              <button
                type="button"
                className="cvs-btn-plan"
                disabled={isSaving}
                onClick={handleSaveAndCreatePlan}
              >
                <ClipboardList size={15} className="cvs-btn-plan__icon" />
                {isSaving ? 'Saving…' : 'Save & Create Treatment Plan'}
              </button>
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
