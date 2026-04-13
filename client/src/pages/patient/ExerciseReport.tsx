import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, XCircle, Play, Minus, Plus,
} from 'lucide-react'
import { markReported } from '@/lib/reportedExercises'
import type { PlanExercise } from './MyPlan'
import './ExerciseReport.css'
import PatientTopNav from '@/components/PatientTopNav'

/* ── Rating control ── */
function RatingControl({
  label,
  required = false,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string
  required?: boolean
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="er-rating">
      <span className="er-rating__label">
        {label}
        {required && <span className="er-required-marker"> *</span>}
      </span>
      <div className="er-rating__controls">
        <button
          className="er-rating__btn er-rating__btn--minus"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
          type="button"
        >
          <Minus size={14} />
        </button>
        <span className="er-rating__value">{value}</span>
        <button
          className="er-rating__btn er-rating__btn--plus"
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label}`}
          type="button"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function ExerciseReport() {
  const navigate = useNavigate()
  const location = useLocation()

  // Exercise is passed via navigation state from MyPlan
  const exercise = (location.state as { exercise: PlanExercise; source?: string } | null)
    ?.exercise ?? null

  const [completionStatus, setCompletionStatus] = useState<'completed' | 'not-completed' | null>(null)
  const [pain, setPain]     = useState(2)
  const [effort, setEffort] = useState(2)
const [notCompletedReason, setNotCompletedReason] = useState('')
  const [changeRequest, setChangeRequest]           = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  function isFormValid(): boolean {
    if (completionStatus === null) return false
    if (completionStatus === 'not-completed') return notCompletedReason.trim().length > 0
    return true
  }

  function handleSave() {
    if (!exercise || !isFormValid()) return
    setSaving(true)

    // TODO: replace with API mutation
    setTimeout(() => {
      console.log({
        exerciseId: exercise.id,
        completed: completionStatus === 'completed',
        pain,
        effort,
        notCompletedReason,
        changeRequest,
      })

      markReported(exercise.id)

      setSaving(false)
      setSaved(true)

      setTimeout(() => navigate('/patient/my-plan'), 800)
    }, 600)
  }

  // ── No exercise data guard ──
  if (!exercise) {
    return (
      <div className="er-page er-page--empty">
        <div className="er-empty-state">
          <p className="er-empty-state__text">No exercise data found.</p>
          <button
            className="er-empty-state__back"
            onClick={() => navigate('/patient/my-plan')}
            type="button"
          >
            <ArrowLeft size={16} />
            Back to My Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="er-page">

      <PatientTopNav />

      {/* ── Main layout ── */}
      <main className="er-main">

        {/* ── Page title (full width, above columns) ── */}
        <div className="er-page-title">
          <button
            className="er-page-title__back"
            onClick={() => navigate('/patient/my-plan')}
            aria-label="Go back"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="er-page-title__info">
            <h1 className="er-page-title__name">{exercise.name}</h1>
            <span className="er-page-title__meta">
              {exercise.desc}&nbsp;|&nbsp;{exercise.duration}
            </span>
          </div>
        </div>

        <div className="er-layout">

          {/* ── LEFT column: media + instructions ── */}
          <div className="er-media-panel">

            {/* Media card */}
            <div className="er-media-card">
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="er-media-card__img"
              />
              <button className="er-media-card__play" aria-label="Play video" type="button">
                <Play size={24} fill="white" />
              </button>
            </div>

            {/* Instructions */}
            <div className="er-instructions">
              <h3 className="er-instructions__title">Instructions</h3>
              <ol className="er-instructions__list">
                {exercise.instructions.map(({ step, text }) => (
                  <li key={step} className="er-instructions__item">{text}</li>
                ))}
              </ol>
            </div>

          </div>

          {/* ── RIGHT column: report form ── */}
          <div className="er-form-panel">

            {/* Completion selector */}
            <div className="er-completion">
              <span className="er-completion__label">
                Did you complete the exercise?
                <span className="er-required-marker"> *</span>
              </span>
              <div className="er-completion__options">
                <button
                  className={`er-completion__btn${completionStatus === 'completed' ? ' er-completion__btn--active-yes' : ''}`}
                  onClick={() => setCompletionStatus('completed')}
                  type="button"
                >
                  <CheckCircle2 size={16} />
                  Completed
                </button>
                <button
                  className={`er-completion__btn${completionStatus === 'not-completed' ? ' er-completion__btn--active-no' : ''}`}
                  onClick={() => setCompletionStatus('not-completed')}
                  type="button"
                >
                  <XCircle size={16} />
                  Not Completed
                </button>
              </div>
            </div>

            {/* Completed fields */}
            {completionStatus === 'completed' && (
              <>
                <div className="er-ratings-row">
                  <RatingControl label="Pain"   required value={pain}   onChange={setPain}   />
                  <RatingControl label="Effort" required value={effort} onChange={setEffort} />
                </div>

                <div className="er-field">
                  <label className="er-field__label" htmlFor="change-request">Change requests</label>
                  <textarea
                    id="change-request"
                    className="er-field__textarea"
                    value={changeRequest}
                    onChange={e => setChangeRequest(e.target.value)}
                    placeholder="Request modifications to this exercise..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Not Completed fields */}
            {completionStatus === 'not-completed' && (
              <>
                <div className="er-ratings-row">
                  <RatingControl label="Pain"   value={pain}   onChange={setPain}   />
                  <RatingControl label="Effort" value={effort} onChange={setEffort} />
                </div>

                <div className="er-field">
                  <label className="er-field__label" htmlFor="not-completed">
                    If not completed, please explain
                    <span className="er-required-marker"> *</span>
                  </label>
                  <textarea
                    id="not-completed"
                    className="er-field__textarea"
                    value={notCompletedReason}
                    onChange={e => setNotCompletedReason(e.target.value)}
                    placeholder="Describe any difficulties or reasons..."
                    rows={4}
                  />
                </div>

                <div className="er-field">
                  <label className="er-field__label" htmlFor="change-request">
                    Change requests
                  </label>
                  <textarea
                    id="change-request"
                    className="er-field__textarea"
                    value={changeRequest}
                    onChange={e => setChangeRequest(e.target.value)}
                    placeholder="Request modifications to this exercise..."
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Save */}
            <button
              className={`er-save-btn${saved ? ' er-save-btn--saved' : ''}`}
              onClick={handleSave}
              disabled={saving || saved || !isFormValid()}
              type="button"
            >
              {saved ? 'Saved! Returning…' : saving ? 'Saving…' : 'Save'}
            </button>

          </div>

        </div>
      </main>

    </div>
  )
}
