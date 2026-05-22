import { useState } from 'react'
import {
  Dumbbell,
  CalendarCheck, ChevronRight,
  Video, MapPin,
} from 'lucide-react'
import './PatientHome.css'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import type { Session } from "@/pages/patient/patient.types.ts"
import { useNavigate } from "react-router-dom"
import { useGetPatientHome } from '@/hooks/paitent/useGetPatinetHome'
import ExerciseItem from './components/ExerciseItem'

// Sessions relative to today
function buildSessions(): Session[] {
  const today = new Date()
  const d = (offset: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    return d
  }
  return [
    { id: 1, title: 'Physiotherapy', professional: 'Dr. Sarah Cohen', date: d(1), time: '10:00 AM', type: 'clinic', color: '#1a56db' },
    { id: 2, title: 'Fitness Training', professional: 'Mike Torres', date: d(3), time: '2:30 PM', type: 'online', color: '#10b981' },
    { id: 3, title: 'Progress Review', professional: 'Dr. Sarah Cohen', date: d(7), time: '11:00 AM', type: 'clinic', color: '#1a56db' },
  ]
}
const sessions = buildSessions()

/* ── Helpers ── */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildWeek() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay()) // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function fmtSession(d: Date) {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/* ── Sub-components ── */
function CalendarCard() {
  const week = buildWeek()
  const today = new Date()
  const [selected, setSelected] = useState(today.getDay())

  return (
    <div className="ph-calendar-card">
      <div className="ph-section__header">
        <h2 className="ph-section__title">Upcoming Sessions</h2>
      </div>

      {/* Week strip */}
      <div className="ph-week-strip">
        {week.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          const hasEvent = sessions.some(s => s.date.toDateString() === day.toDateString())
          return (
            <button
              key={i}
              className={`ph-week-day${selected === i ? ' ph-week-day--selected' : ''}${isToday ? ' ph-week-day--today' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="ph-week-day__label">{DAYS[day.getDay()]}</span>
              <span className="ph-week-day__num">{day.getDate()}</span>
              {hasEvent && <span className="ph-week-day__dot" />}
            </button>
          )
        })}
      </div>

      {/* Session list */}
      <div className="ph-session-list">
        {sessions.map(s => (
          <div className="ph-session-item" key={s.id} style={{ borderLeftColor: s.color }}>
            <div className="ph-session-item__left">
              <span className="ph-session-item__title">{s.title}</span>
              <span className="ph-session-item__pro">{s.professional}</span>
              <span className="ph-session-item__meta">
                {fmtSession(s.date)} · {s.time}
              </span>
            </div>
            <div className="ph-session-item__right">
              <span className={`ph-session-item__type ph-session-item__type--${s.type}`}>
                {s.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
                {s.type === 'online' ? 'Online' : 'Clinic'}
              </span>
              <ChevronRight size={16} className="ph-session-item__arrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function PatientHome() {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)
  const { data, isLoading } = useGetPatientHome()

  const stats = [
    {
      icon: CalendarCheck,
      value: `${data?.weekly_completion.EXECOMP ?? 0}/${data?.weekly_completion.EXETDW ?? 0}`,
      label: 'Exercises Completed This Week',
      color: '#10b981',
    },
    {
      icon: Dumbbell,
      value: `${data?.daily_completions.completed_sum ?? 0}/${data?.daily_completions.total ?? 0}`,
      label: 'Today',
      color: '#1a56db',
    },
  ]

  const physioPercent = data?.physiotherapist_percentage ?? 0
  const fitnessPercent = data?.fitness_percentage ?? 0
  const dailyExercises = data?.daily_exercises ?? []

  return (
    <div className="ph-page pt-16">

      <TopNav />

      {/* ── Main ── */}
      <main className="ph-main">

        {/* Greeting */}
        <div className="ph-greeting-block">
          <div>
            <h1 className="ph-greeting">Hello, {user?.first_name || 'Guest'}</h1>
            <p className="ph-greeting__sub">Let's keep up the good work today!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ph-stats-strip">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div
              className="ph-stat-card"
              key={label}
              style={{ '--ph-stat-color': color } as React.CSSProperties}
            >
              <div className="ph-stat-card__icon">
                <Icon size={18} />
              </div>
              <div className="ph-stat-card__body">
                <span className="ph-stat-card__value">{value}</span>
                <span className="ph-stat-card__label">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="ph-progress-grid">
          <div className="ph-progress-card">
            <div className="ph-progress-card__header">
              <span className="ph-progress-card__label">Physiotherapy Progress</span>
              <span className="ph-progress-card__percent">{data?.physiotherapist_percentage ?? 0}%</span>
            </div>
            <div className="ph-progress-card__bar-track">
              <div className="ph-progress-card__bar-fill" style={{ width: `${physioPercent}%` }} />
            </div>
          </div>

          <div className="ph-progress-card">
            <div className="ph-progress-card__header">
              <span className="ph-progress-card__label">Fitness Progress</span>
              <span className="ph-progress-card__percent ph-progress-card__percent--fitness">
                {data?.fitness_percentage ?? 0}%
              </span>
            </div>
            <div className="ph-progress-card__bar-track ph-progress-card__bar-track--fitness">
              <div
                className="ph-progress-card__bar-fill ph-progress-card__bar-fill--fitness"
                style={{ width: `${fitnessPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop two-col grid: Calendar + Quick Actions */}
        <div className="ph-mid-grid">

          {/* Today Plan */}
          <div className="ph-right-col">
            <section className="ph-section">
              <div className="ph-section__header">
                <h2 className="ph-section__title">Today Plan</h2>
                <button className="ph-section__view-all--btn" onClick={() => navigate('/patient/my-plan')}>All Exercises</button>
              </div>
              <div className="ph-exercise-list">
                {isLoading
                  ? <p className="ph-loading">Loading exercises…</p>
                  : dailyExercises.length === 0
                    ? (
                      <div className="ph-exercise-empty">
                        <Dumbbell size={32} className="ph-exercise-empty__icon" />
                        <p className="ph-exercise-empty__title">No exercises today</p>
                        <p className="ph-exercise-empty__sub">Your plan for today is empty. Enjoy the rest!</p>
                      </div>
                    )
                    : dailyExercises.map(ex => <ExerciseItem key={ex.exercise_id} exercise={ex} />)
                }
              </div>
            </section>
          </div>

          {/* Calendar */}
          <CalendarCard />

        </div>

      </main>

    </div>
  )
}
