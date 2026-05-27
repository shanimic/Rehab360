import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ChevronLeft, Target, Dumbbell, Loader2, Plus, Trash2 } from 'lucide-react'
import { useAtomValue } from 'jotai'
import axios from 'axios'
import { authAtom } from '@/store/authAtom'
import { visitSummariesPath } from '@/lib/patientRoutes'
import TopNav from '@/components/TopNav'
import AddExerciseModal from './AddExerciseModal'
import type { ExerciseEntry } from './AddExerciseModal'
import {
  useTreatmentPlanContext,
  usePlanExercises,
  useCreateTreatmentPlan,
} from '@/hooks/useTreatmentPlan'
import type { CreateTreatmentPlanRequest } from '@/types'

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
  const { patientId, sessionId: sessionIdParam } = useParams<{ patientId: string; sessionId: string }>()
  const auth = useAtomValue(authAtom)

  const state = (location.state ?? {}) as Partial<LocationState>
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null

  const [form, setForm] = useState<PlanFormState>({
    goal: '',
    start_date: '',
    end_date: '',
    notes: '',
  })

  const contextQuery = useTreatmentPlanContext(sessionId)
  const visitType = contextQuery.data?.visit_type
    ?? (auth?.role === 'FITNESS_TRAINER' ? 'FITNESS' : 'PHYSIOTHERAPIST')
  const isFitness = visitType === 'FITNESS'
  const exercisesQuery = usePlanExercises(visitType)
  const createTreatmentPlan = useCreateTreatmentPlan()

  const isSaving = createTreatmentPlan.isPending

  // medical_diagnosis: prefer live data, fall back to navigation state while loading
  const medicalDiagnosis =
    contextQuery.data?.medical_diagnosis ?? state.medical_diagnosis ?? ''

  const [errors, setErrors] = useState<FormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const isFormValid = exercises.length > 0

  function handleChange(field: keyof PlanFormState, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.goal.trim()) newErrors.goal = `${visitType === 'FITNESS' ? 'Fitness' : 'Treatment'} goal is required`
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

  function handleSave(): void {
    if (!validate()) return
    if (sessionId === null) {
      setSaveError('No session linked. Please save a visit summary first.')
      return
    }
    if (exercises.length === 0) {
      setSaveError('Please add at least one exercise before saving.')
      return
    }
    setSaveError(null)

    const body: CreateTreatmentPlanRequest = {
      goal: form.goal,
      start_date: form.start_date,
      end_date: form.end_date,
      notes: form.notes.trim() || null,
      exercises: exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        reps: ex.reps,
        num_sets: ex.sets,
        weight: ex.weight,
        time_duration: ex.frequencyAmount,
        time_unit: ex.frequencyUnit,
        description: ex.description || null,
      })),
    }

    createTreatmentPlan.mutate(
      { sessionId, body },
      {
        onSuccess: () => {
          if (!auth?.role || !patientId) return
          navigate(visitSummariesPath(auth.role, patientId))
        },
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.data?.detail) {
            setSaveError(err.response.data.detail as string)
          } else {
            setSaveError('Failed to save treatment plan. Please try again.')
          }
        },
      },
    )
  }

  return (
    <div className="ctp-page">
      <TopNav />

      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button
            type="button"
            className="patient-nav__back"
            onClick={() => {
              if (!auth?.role || !patientId) { navigate(-1); return }
              navigate(visitSummariesPath(auth.role, patientId))
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">New {isFitness ? 'Fitness' : 'Treatment'} Plan</h1>
        </div>

        <div className="ctp-body">

          {/* ── Plan Details — grouped, section-divided card ── */}
          <div className="ctp-card ctp-card--plan">

            {/* Medical Diagnosis */}
            <div className="ctp-section">
              <span className="ctp-label">Medical Diagnosis</span>
              <div className="ctp-readonly-field">
                {contextQuery.isLoading ? 'Loading…' : (medicalDiagnosis || '—')}
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
                {visitType === 'FITNESS' ? 'Fitness' : 'Treatment'} Goal <span className="ctp-required">*</span>
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
              <h2 className="ctp-exercises__title">Exercises <span className="ctp-required">*</span></h2>
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
          {saveError && (
            <p className="ctp-error-msg" style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
              {saveError}
            </p>
          )}
          <div className="ctp-actions">
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
                `Save ${isFitness ? 'Fitness' : 'Treatment'} Plan`
              )}
            </button>
          </div>

        </div>
      </main>

      {isModalOpen && (
        <AddExerciseModal
          onAdd={handleAddExercise}
          onClose={() => setIsModalOpen(false)}
          exercises={exercisesQuery.data ?? []}
          isLoadingExercises={exercisesQuery.isLoading}
        />
      )}
    </div>
  )
}
