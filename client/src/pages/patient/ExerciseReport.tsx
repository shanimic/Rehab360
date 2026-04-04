import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, Circle, Play, Minus, Plus,
  Home, Dumbbell, BarChart2, Sparkles, User,
  Bell, Menu,
} from 'lucide-react'
import './ExerciseReport.css'

/* ── Types ── */
interface Instruction {
  step: number
  text: string
}

interface ExerciseDetail {
  id: number
  name: string
  plan: 'Treatment Plan' | 'Training Plan'
  desc: string
  duration: string
  done: boolean
  imageUrl: string
  instructions: Instruction[]
}

/* ── Static data ── */
const exercise: ExerciseDetail = {
  id: 1,
  name: 'Push Up',
  plan: 'Treatment Plan',
  desc: '100 Push up a day',
  duration: '3 minutes',
  done: true,
  imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  instructions: [
    { step: 1, text: 'Stand with feet shoulder-width apart' },
    { step: 2, text: 'Keep your arms relaxed at your sides' },
    { step: 3, text: 'Slowly rotate shoulders forward in circular motion' },
  ],
}

/* ── Nav items ── */
const bottomNav = [
  { label: 'Home', icon: Home, active: false },
  { label: 'Exercises', icon: Dumbbell, active: true },
  { label: 'Progress', icon: BarChart2, active: false },
  { label: 'AI Search', icon: Sparkles, active: false },
  { label: 'Profile', icon: User, active: false },
]

const topNav = [
  { label: 'Exercises', icon: Dumbbell },
  { label: 'AI Search', icon: Sparkles },
  { label: 'My Profile', icon: User },
]

/* ── Rating control ── */
function RatingControl({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="er-rating">
      <span className="er-rating__label">{label}</span>
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
  const [completed, setCompleted] = useState(exercise.done)
  const [pain, setPain] = useState(2)
  const [effort, setEffort] = useState(2)
  const [notCompletedReason, setNotCompletedReason] = useState('')
  const [changeRequest, setChangeRequest] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // TODO: wire to API mutation
    console.log({ exerciseId: exercise.id, completed, pain, effort, notCompletedReason, changeRequest })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="er-page">

      {/* ── Desktop Header ── */}
      <header className="er-header">
        <div className="er-header__logo">
          <img src="/logo.svg" alt="Rehab360" className="er-header__logo-img" />
          <span className="er-header__brand">Rehab<span>360</span></span>
        </div>

        <nav className="er-header__nav">
          {topNav.map(({ label, icon: Icon }) => (
            <button key={label} className="er-header__nav-link" type="button">
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

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
        <div className="er-layout">

          {/* ── Left column: media + exercise info + instructions ── */}
          <div className="er-left">

            {/* Media card */}
            <div className="er-media-card">
              <button
                className="er-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                type="button"
              >
                <ArrowLeft size={18} />
              </button>

              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="er-media-card__img"
              />

              <button className="er-media-card__play" aria-label="Play video" type="button">
                <Play size={24} fill="white" />
              </button>
            </div>

            {/* Exercise name + completion toggle */}
            <div className="er-exercise-info">
              <button
                className="er-exercise-info__check"
                onClick={() => setCompleted(prev => !prev)}
                aria-label="Toggle completion"
                type="button"
              >
                {completed
                  ? <CheckCircle2 size={26} className="er-exercise-info__check--done" />
                  : <Circle size={26} className="er-exercise-info__check--todo" />}
              </button>
              <div className="er-exercise-info__text">
                <span className="er-exercise-info__name">{exercise.name}</span>
                <span className="er-exercise-info__meta">
                  {exercise.desc}&nbsp;|&nbsp;{exercise.duration}
                </span>
              </div>
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

          {/* ── Right column: report form ── */}
          <div className="er-right">

            {/* Ratings */}
            <div className="er-ratings-row">
              <RatingControl label="Pain" value={pain} onChange={setPain} />
              <RatingControl label="Effort" value={effort} onChange={setEffort} />
            </div>

            {/* Not completed reason */}
            <div className="er-field">
              <label className="er-field__label" htmlFor="not-completed">
                If not completed, please explain
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

            {/* Change requests */}
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

            {/* Save */}
            <button
              className={`er-save-btn${saved ? ' er-save-btn--saved' : ''}`}
              onClick={handleSave}
              type="button"
            >
              {saved ? 'Saved!' : 'Save'}
            </button>

          </div>
        </div>
      </main>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="er-bottom-nav">
        {bottomNav.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`er-bottom-nav__item${active ? ' er-bottom-nav__item--active' : ''}`}
            aria-label={label}
            type="button"
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}
