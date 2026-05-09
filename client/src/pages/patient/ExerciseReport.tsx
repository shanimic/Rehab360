import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, XCircle, Minus, Plus,
  Bell, Menu,
} from 'lucide-react'
import { markReported } from '@/lib/reportedExercises'
import type { MyPlan } from '@/types/patient'
import './ExerciseReport.css'
import { useSaveExerciseReport } from '@/hooks/paitent/useSaveExerciseReport'
import { useGetExercise } from '@/hooks/paitent/useGetExercise'

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

/* ── Helpers ── */
function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

/* ── Page ── */
export default function ExerciseReport() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams();
  const { data } = useGetExercise(Number(id))

  // Exercise is passed via navigation state from MyPlan
  const exercise = (location.state as { exercise: MyPlan; source?: string } | null)
    ?.exercise ?? null

  const saveReport = useSaveExerciseReport()
  const [completionStatus, setCompletionStatus] = useState<'completed' | 'not-completed' | null>(null)
  const [pain, setPain] = useState(2)
  const [effort, setEffort] = useState(2)
  const [notCompletedReason, setNotCompletedReason] = useState('')
  const [changeRequest, setChangeRequest] = useState('')

  function isFormValid(): boolean {
    if (completionStatus === null) return false
    if (completionStatus === 'not-completed') return notCompletedReason.trim().length > 0
    return true
  }

  function handleSave() {
    if (!exercise || !isFormValid()) return

    saveReport.mutate(
      {
        exercise_id: exercise.exercise_id,
        execution_status: completionStatus === 'completed',
        pain_level: pain,
        effort_level: effort,
        reason_for_non_performance: notCompletedReason,
        request_for_change: changeRequest,
      },
      { onSuccess: () => markReported(exercise.exercise_id) },
    )
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

      {/* ── Desktop Header ── */}
      <header className="er-header">
        <div className="er-header__logo">
          <img src="/logo.svg" alt="Rehab360" className="er-header__logo-img" />
          <span className="er-header__brand">Rehab<span>360</span></span>
        </div>

        <div className="er-header__actions">
          <button className="er-header__icon-btn" aria-label="Notifications" type="button">
            <Bell size={20} />
            <span className="er-header__badge">3</span>
          </button>
          <button className="er-header__icon-btn er-header__menu-btn" aria-label="Menu" type="button">
            <Menu size={20} />
          </button>
        </div>
      </header>

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
            <h1 className="er-page-title__name">{data?.exercise_name}</h1>
            <span className="er-page-title__meta">
              {data?.reps} Reps | {data?.num_sets} Sets | {data?.visit_type}
            </span>
          </div>
        </div>

        <div className="er-layout">

          {/* ── LEFT column: media + instructions ── */}
          <div className="er-media-panel">

            {/* Media card */}
            <div className="er-media-card">
              {data?.ex_video_url && (
                <iframe
                  className="er-media-card__img"
                  src={getYouTubeEmbedUrl(data.ex_video_url)}
                  title={data.exercise_name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Instructions */}
            <div className="er-instructions">
              <h3 className="er-instructions__title">Instructions</h3>
              <ol className="er-instructions__list">
                <li>{data?.text_instructions}</li>
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
                  <RatingControl label="Pain" required value={pain} onChange={setPain} />
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
                  <RatingControl label="Pain" value={pain} onChange={setPain} />
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
              className={`er-save-btn${saveReport.isSuccess ? ' er-save-btn--saved' : ''}`}
              onClick={handleSave}
              disabled={saveReport.isPending || saveReport.isSuccess || !isFormValid()}
              type="button"
            >
              {saveReport.isSuccess ? 'Saved! Returning…' : saveReport.isPending ? 'Saving…' : 'Save'}
            </button>

          </div>

        </div>
      </main>

    </div>
  )
}
