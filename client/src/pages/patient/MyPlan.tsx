import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, ChevronRight, CheckCircle2,
  Home, Dumbbell, BarChart2, MessageSquare, Search as SearchIcon,
} from 'lucide-react'
import { getReportedToday } from '@/lib/reportedExercises'
import PatientNavbar from '@/components/PatientNavbar'
import './MyPlan.css'

/* ── Types ── */
export interface PlanExercise {
  id: number
  name: string
  plan: 'Treatment Plan' | 'Training Plan'
  desc: string
  duration: string
  imageUrl: string
  instructions: { step: number; text: string }[]
  thumb: { from: string; to: string; iconColor: string }
}

/* ── Static data ── */
const thumbs = {
  pushUp: { from: '#ff9a9e', to: '#e84393', iconColor: '#fff' },
  sitUp: { from: '#2d3436', to: '#636e72', iconColor: '#a78bfa' },
  kneePush: { from: '#74b9ff', to: '#0984e3', iconColor: '#fff' },
  shoulder: { from: '#a29bfe', to: '#6c5ce7', iconColor: '#fff' },
}

const ALL_TODAY: PlanExercise[] = [
  {
    id: 1,
    name: 'Push Up',
    plan: 'Treatment Plan',
    desc: '100 Push up a day',
    duration: '3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    instructions: [
      { step: 1, text: 'Start in a high plank position with hands shoulder-width apart' },
      { step: 2, text: 'Lower your chest to the floor, keeping elbows at 45°' },
      { step: 3, text: 'Push back up to starting position and repeat' },
    ],
    thumb: thumbs.pushUp,
  },
  {
    id: 2,
    name: 'Sit Up',
    plan: 'Training Plan',
    desc: '20 Sit up a day',
    duration: '5 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    instructions: [
      { step: 1, text: 'Lie flat on your back with knees bent and feet flat' },
      { step: 2, text: 'Place hands behind your head or cross them over your chest' },
      { step: 3, text: 'Engage your core and lift your torso towards your knees' },
    ],
    thumb: thumbs.sitUp,
  },
  {
    id: 3,
    name: 'Knee Push Up',
    plan: 'Treatment Plan',
    desc: '20 Knee push up a day',
    duration: '4 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    instructions: [
      { step: 1, text: 'Start on hands and knees with hands shoulder-width apart' },
      { step: 2, text: 'Lower your chest towards the floor keeping a straight back' },
      { step: 3, text: 'Push up to starting position and repeat' },
    ],
    thumb: thumbs.kneePush,
  },
]

const TOMORROW: PlanExercise[] = [
  {
    id: 4,
    name: 'Sit Up',
    plan: 'Training Plan',
    desc: '20 Sit up a day',
    duration: '5 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    instructions: [
      { step: 1, text: 'Lie flat on your back with knees bent and feet flat' },
      { step: 2, text: 'Place hands behind your head or cross them over your chest' },
      { step: 3, text: 'Engage your core and lift your torso towards your knees' },
    ],
    thumb: thumbs.sitUp,
  },
  {
    id: 5,
    name: 'Knee Push Up',
    plan: 'Treatment Plan',
    desc: '20 Knee push up a day',
    duration: '4 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    instructions: [
      { step: 1, text: 'Start on hands and knees with hands shoulder-width apart' },
      { step: 2, text: 'Lower your chest towards the floor keeping a straight back' },
      { step: 3, text: 'Push up to starting position and repeat' },
    ],
    thumb: thumbs.kneePush,
  },
  {
    id: 6,
    name: 'Shoulder Stretch',
    plan: 'Treatment Plan',
    desc: '15 reps each side',
    duration: '3 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    instructions: [
      { step: 1, text: 'Stand with feet shoulder-width apart' },
      { step: 2, text: 'Keep your arms relaxed at your sides' },
      { step: 3, text: 'Slowly rotate shoulders forward in circular motion' },
    ],
    thumb: thumbs.shoulder,
  },
]

/* ── Nav items ── */
const bottomNav = [
  { label: 'Home', icon: Home, active: false },
  { label: 'Exercises', icon: Dumbbell, active: true },
  { label: 'Analytics', icon: BarChart2, active: false },
  { label: 'Chats', icon: MessageSquare, active: false },
  { label: 'Search', icon: SearchIcon, active: false },
]

/* ── Exercise Card ── */
function ExerciseCard({
  exercise,
  onClick,
  completed = false,
}: {
  exercise: PlanExercise
  onClick?: () => void
  completed?: boolean
}) {
  const { from, to, iconColor } = exercise.thumb
  return (
    <button
      className={`mp-card${completed ? ' mp-card--completed' : ''}`}
      onClick={completed ? undefined : onClick}
      disabled={completed}
      type="button"
    >
      <div
        className="mp-card__thumb"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        aria-hidden
      >
        {completed
          ? <CheckCircle2 size={26} color="#22c55e" strokeWidth={2} />
          : <Dumbbell size={26} color={iconColor} strokeWidth={1.6} />}
      </div>
      <div className="mp-card__info">
        <span className="mp-card__name">{exercise.name}</span>
        <span className="mp-card__desc">{exercise.desc}</span>
      </div>
      {!completed && <ChevronRight size={18} className="mp-card__arrow" />}
    </button>
  )
}

/* ── Page ── */
export default function MyPlan() {
  const navigate = useNavigate()

  // Split exercises into active/completed on every mount
  // (React Router re-mounts this component on each navigation to /patient/my-plan)
  const [{ active, completed }] = useState(() => {
    const reported = getReportedToday()
    return {
      active: ALL_TODAY.filter(ex => !reported.has(ex.id)),
      completed: ALL_TODAY.filter(ex => reported.has(ex.id)),
    }
  })

  function openReport(exercise: PlanExercise) {
    navigate(`/patient/exercise/${exercise.id}`, {
      state: { exercise, source: 'today' },
    })
  }

  return (
    <div className="mp-page">

      <PatientNavbar activeNavItem="Exercises" />

      {/* ── Main ── */}
      <main className="mp-main">

        {/* Page title row */}
        <div className="mp-title-row">
          <div className="mp-title-left">
            <h1 className="mp-title">My Plan</h1>
            <span className="mp-title-sub">
              {active.length === 0
                ? 'All exercises reported today!'
                : `${active.length} exercise${active.length !== 1 ? 's' : ''} remaining today`}
            </span>
          </div>
          <div className="mp-title-actions">
            <button className="mp-new-btn" type="button">
              <Plus size={15} />
              New
            </button>
          </div>
        </div>

        {/* Two-col grid on desktop, stacked on mobile */}
        <div className="mp-plan-grid">

          {/* Today */}
          <section className="mp-section">
            <div className="mp-section__header">
              <h2 className="mp-section__title">Today plan</h2>
              <button className="mp-section__view-all" type="button">View All</button>
            </div>

            {active.length === 0 && completed.length === 0 ? (
              <div className="mp-empty">
                <span className="mp-empty__icon">🎉</span>
                <p className="mp-empty__text">All done for today!</p>
              </div>
            ) : (
              <div className="mp-section__list">
                {active.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} onClick={() => openReport(ex)} />
                ))}
                {completed.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} completed />
                ))}
              </div>
            )}
          </section>

          {/* Tomorrow */}
          <section className="mp-section">
            <div className="mp-section__header">
              <h2 className="mp-section__title">Tomorrow plan</h2>
            </div>
            <div className="mp-section__list">
              {TOMORROW.map(ex => (
                <button
                  key={ex.id}
                  className="mp-card mp-card--tomorrow"
                  type="button"
                  disabled
                  aria-label={`${ex.name} — available tomorrow`}
                >
                  <div
                    className="mp-card__thumb"
                    style={{ background: `linear-gradient(135deg, ${ex.thumb.from}, ${ex.thumb.to})` }}
                    aria-hidden
                  >
                    <Dumbbell size={26} color={ex.thumb.iconColor} strokeWidth={1.6} />
                  </div>
                  <div className="mp-card__info">
                    <span className="mp-card__name">{ex.name}</span>
                    <span className="mp-card__desc">{ex.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="mp-bottom-nav">
        {bottomNav.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`mp-bottom-nav__item${active ? ' mp-bottom-nav__item--active' : ''}`}
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
