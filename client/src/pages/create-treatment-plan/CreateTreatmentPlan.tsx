import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Target, Dumbbell, Loader2, Plus, Trash2 } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import AddExerciseModal from './AddExerciseModal'
import type { ExerciseEntry } from './AddExerciseModal'

import '../patient-details/PatientDetails.css'
import './CreateTreatmentPlan.css'

// ── Types ────────────────────────────────────────────────────────────────────
export type { ExerciseEntry }

export interface PlanFormState {
  goal: string
  start_date: string
  end_date: string
  notes: string
}

interface LocationState {
  medical_diagnosis?: string
  patient_id?: string
  plan_data?: PlanFormState
}

interface FormErrors {
  goal?: string
  start_date?: string
  end_date?: string
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CreateTreatmentPlan() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAtomValue(authAtom)

  const state = (location.state ?? {}) as Partial<LocationState>
  const medicalDiagnosis = state.medical_diagnosis ?? ''
  const patientId = state.patient_id ?? '1'

  // Restore any previously entered draft so data survives back-and-forth navigation
  const draft = state.plan_data

  const [form, setForm] = useState<PlanFormState>({
    goal: draft?.goal ?? '',
    start_date: draft?.start_date ?? '',
    end_date: draft?.end_date ?? '',
    notes: draft?.notes ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Goal + Start Date + End Date are all required
  const isFormValid =
    form.goal.trim().length > 0 &&
    form.start_date.length > 0 &&
    form.end_date.length > 0

  function handleChange(field: keyof PlanFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.goal.trim()) newErrors.goal = 'Treatment goal is required'
    if (!form.start_date) newErrors.start_date = 'Start date is required'
    if (!form.end_date) newErrors.end_date = 'End date is required'
    else if (form.start_date && form.end_date < form.start_date) {
      newErrors.end_date = 'End date must be on or after start date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleAddExercise(exercise: ExerciseEntry): void {
    setExercises((prev) => [...prev, exercise])
    setIsModalOpen(false)
  }

  function handleRemoveExercise(id: string): void {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  // Save: 800 ms simulation → return to CreateVisitSummary with the saved plan
  function handleSave(): void {
    if (!validate()) return
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      navigate(`/patient/${patientId}/visit-summaries/new`, {
        state: {
          saved_plan: form,
          medical_diagnosis: medicalDiagnosis,
        },
      })
    }, 800)
  }

  // Back: carry the current draft so CreateVisitSummary can restore it on return
  function handleBack(): void {
    navigate(`/patient/${patientId}/visit-summaries/new`, {
      state: {
        plan_data: form,
        medical_diagnosis: medicalDiagnosis,
      },
    })
  }

  return (
    <div className="ctp-page">
      <TopNav doctorName={auth?.first_name ?? 'Cohen'} />

      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={handleBack}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">New Treatment Plan</h1>
        </div>

        <div className="ctp-body">

          {/* ── Plan Details — grouped, section-divided card ── */}
          <div className="ctp-card ctp-card--plan">

            {/* Medical Diagnosis */}
            <div className="ctp-section">
              <span className="ctp-label">Medical Diagnosis</span>
              <div className="ctp-readonly-field">
                {medicalDiagnosis || '—'}
              </div>
            </div>

            <div className="ctp-section-divider" />

            {/* Timeline */}
            <div className="ctp-section">
              <div className="ctp-form-row">
                <div className="ctp-field">
                  <label className="ctp-label" htmlFor="ctp-start-date">
                    Start Date <span className="ctp-required">*</span>
                  </label>
                  <input
                    id="ctp-start-date"
                    type="date"
                    className={`ctp-input${errors.start_date ? ' ctp-input--error' : ''}`}
                    value={form.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                  {errors.start_date && <p className="ctp-error-msg">{errors.start_date}</p>}
                </div>

                <div className="ctp-field">
                  <label className="ctp-label" htmlFor="ctp-end-date">
                    End Date <span className="ctp-required">*</span>
                  </label>
                  <input
                    id="ctp-end-date"
                    type="date"
                    className={`ctp-input${errors.end_date ? ' ctp-input--error' : ''}`}
                    value={form.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                  {errors.end_date && <p className="ctp-error-msg">{errors.end_date}</p>}
                </div>
              </div>
            </div>

            <div className="ctp-section-divider" />

            {/* General Notes */}
            <div className="ctp-section">
              <label className="ctp-label" htmlFor="ctp-notes">General Notes</label>
              <textarea
                id="ctp-notes"
                className="ctp-textarea"
                placeholder="Clinical observations, contraindications, and safety precautions…"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* ── Treatment Goal — dashed card ── */}
          <div className={`ctp-card ctp-card--goal${errors.goal ? ' ctp-card--goal-error' : ''}`}>
            <div className="ctp-goal__header">
              <Target size={16} className="ctp-goal__icon" />
              <span className="ctp-goal__title">
                Treatment Goal <span className="ctp-required">*</span>
              </span>
            </div>
            <textarea
              id="ctp-goal"
              className="ctp-goal__input"
              placeholder="Describe the main rehabilitation goal, e.g. Restore full range of motion in the shoulder within 8 weeks…"
              value={form.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              rows={3}
            />
            {errors.goal && <p className="ctp-error-msg">{errors.goal}</p>}
          </div>

          {/* ── Exercises ── */}
          <div className="ctp-exercises">
            <div className="ctp-exercises__header">
              <Dumbbell size={16} className="ctp-exercises__icon ctp-exercises__icon--active" />
              <h2 className="ctp-exercises__title">Exercises</h2>
              {exercises.length > 0 && (
                <span className="ctp-exercises__count">{exercises.length}</span>
              )}
            </div>

            {exercises.length === 0 ? (
              <p className="ctp-exercises__placeholder">
                No exercises added yet. Use the button below to build the plan.
              </p>
            ) : (
              <ul className="ctp-exercise-list">
                {exercises.map((ex) => (
                  <li key={ex.id} className="ctp-exercise-card">
                    <div className="ctp-exercise-card__top">
                      <span className="ctp-exercise-card__name">{ex.name}</span>
                      <button
                        type="button"
                        className="ctp-exercise-card__remove"
                        onClick={() => handleRemoveExercise(ex.id)}
                        aria-label={`Remove ${ex.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="ctp-exercise-card__meta">
                      <span>{ex.sets} sets × {ex.reps} reps</span>
                      {ex.weight > 0 && <span>{ex.weight} kg</span>}
                      <span>{ex.frequencyAmount}× {ex.frequencyUnit}</span>
                    </div>
                    {ex.description && (
                      <p className="ctp-exercise-card__desc">{ex.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="ctp-btn-add-exercise ctp-btn-add-exercise--active"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={14} />
              Add Exercise
            </button>
          </div>

          {/* ── Actions ── */}
          <div className="ctp-actions">
            <button
              type="button"
              className="ctp-btn-back"
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </button>
            <button
              type="button"
              className="ctp-btn-save"
              onClick={handleSave}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="ctp-spinner" />
                  Saving…
                </>
              ) : (
                'Save Treatment Plan'
              )}
            </button>
          </div>

        </div>
      </main>

      {isModalOpen && (
        <AddExerciseModal
          onAdd={handleAddExercise}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
