import {
  Bell, Menu, CheckCircle2, Circle,
  Home, Dumbbell, BarChart2, Sparkles, User,
  ClipboardList, Flame, CalendarCheck, ChevronRight,
  Video, MapPin,
} from 'lucide-react'
import { useState } from 'react'
import './PatientHome.css'

/* ── Types ── */
interface Exercise {
  id: number
  name: string
  plan: 'Treatment Plan' | 'Training Plan'
  desc: string
  done: boolean
}

interface Session {
  id: number
  title: string
  professional: string
  date: Date
  time: string
  type: 'online' | 'clinic'
  color: string
}

/* ── Static data ── */
const exercises: Exercise[] = [
  { id: 1, name: 'Push Up',       plan: 'Treatment Plan', desc: '100 Push ups a day',        done: true  },
  { id: 2, name: 'Sit Up',        plan: 'Training Plan',  desc: '20 Sit ups a day',           done: false },
  { id: 3, name: 'Knee Push Up',  plan: 'Treatment Plan', desc: '20 Knee push ups a day',     done: false },
  { id: 4, name: 'Shoulder Stretch', plan: 'Treatment Plan', desc: '15 reps each side',       done: false },
]

// Sessions relative to today
function buildSessions(): Session[] {
  const today = new Date()
  const d = (offset: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    return d
  }
  return [
    { id: 1, title: 'Physiotherapy',     professional: 'Dr. Sarah Cohen', date: d(1), time: '10:00 AM', type: 'clinic',  color: '#1a56db' },
    { id: 2, title: 'Fitness Training',  professional: 'Mike Torres',     date: d(3), time: '2:30 PM',  type: 'online',  color: '#10b981' },
    { id: 3, title: 'Progress Review',   professional: 'Dr. Sarah Cohen', date: d(7), time: '11:00 AM', type: 'clinic',  color: '#1a56db' },
  ]
}
const sessions = buildSessions()

const completedCount  = exercises.filter(e => e.done).length
const progressPercent = Math.round((completedCount / exercises.length) * 100)

const stats = [
  { icon: Flame,         value: '5',                            label: 'Day Streak',  color: '#f97316' },
  { icon: CalendarCheck, value: '12',                           label: 'This Week',   color: '#10b981' },
  { icon: Dumbbell,      value: `${completedCount}/${exercises.length}`, label: 'Today', color: '#1a56db' },
]

/* ── Helpers ── */
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
function ExerciseItem({ exercise }: { exercise: Exercise }) {
  return (
    <div className="ph-exercise-item">
      <div className="ph-exercise-item__check">
        {exercise.done
          ? <CheckCircle2 size={24} className="ph-exercise-item__check--done" />
          : <Circle      size={24} className="ph-exercise-item__check--todo" />}
      </div>
      <div className="ph-exercise-item__info">
        <span className="ph-exercise-item__name">{exercise.name}</span>
        <span className={`ph-exercise-item__badge ph-exercise-item__badge--${exercise.plan === 'Treatment Plan' ? 'treatment' : 'training'}`}>
          {exercise.plan}
        </span>
        <span className="ph-exercise-item__desc">{exercise.desc}</span>
      </div>
    </div>
  )
}

function CalendarCard() {
  const week  = buildWeek()
  const today = new Date()
  const [selected, setSelected] = useState(today.getDay())

  return (
    <div className="ph-calendar-card">
      <div className="ph-section__header">
        <h2 className="ph-section__title">Upcoming Sessions</h2>
        <button className="ph-section__view-all">View All</button>
      </div>

      {/* Week strip */}
      <div className="ph-week-strip">
        {week.map((day, i) => {
          const isToday  = day.toDateString() === today.toDateString()
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

/* ── Nav items ── */
const bottomNav = [
  { label: 'Home',      icon: Home,     active: true  },
  { label: 'Exercises', icon: Dumbbell, active: false },
  { label: 'Progress',  icon: BarChart2,active: false },
  { label: 'AI Search', icon: Sparkles, active: false },
  { label: 'Profile',   icon: User,     active: false },
]

const topNav = [
  { label: 'Exercises', icon: Dumbbell },
  { label: 'AI Search', icon: Sparkles },
  { label: 'My Profile',icon: User     },
]

/* ── Page ── */
export default function PatientHome() {
  return (
    <div className="ph-page">

      {/* ── Header ── */}
      <header className="ph-header">
        <div className="ph-header__logo">
          <img src="/logo.svg" alt="Rehab360" className="ph-header__logo-img" />
          <span className="ph-header__brand">Rehab<span>360</span></span>
        </div>

        {/* Desktop nav links */}
        <nav className="ph-header__nav">
          {topNav.map(({ label, icon: Icon }) => (
            <button key={label} className="ph-header__nav-link">
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="ph-header__actions">
          <button className="ph-header__icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="ph-header__badge">3</span>
          </button>
          <button className="ph-header__icon-btn ph-header__menu-btn" aria-label="Menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="ph-main">

        {/* Greeting */}
        <div className="ph-greeting-block">
          <div>
            <h1 className="ph-greeting">Hello, Dana 👋</h1>
            <p className="ph-greeting__sub">Let's keep up the good work today!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ph-stats-strip">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div className="ph-stat-card" key={label}>
              <div className="ph-stat-card__icon" style={{ background: `${color}18`, color }}>
                <Icon size={18} />
              </div>
              <div className="ph-stat-card__body">
                <span className="ph-stat-card__value" style={{ color }}>{value}</span>
                <span className="ph-stat-card__label">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="ph-progress-card">
          <div className="ph-progress-card__header">
            <span className="ph-progress-card__label">Today's Progress</span>
            <span className="ph-progress-card__percent">{progressPercent}%</span>
          </div>
          <div className="ph-progress-card__bar-track">
            <div className="ph-progress-card__bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="ph-progress-card__sub">{completedCount} of {exercises.length} exercises completed</p>
        </div>

        {/* Desktop two-col grid: Calendar + Quick Actions */}
        <div className="ph-mid-grid">

          {/* Calendar */}
          <CalendarCard />

          {/* Quick Actions + Today Plan stacked */}
          <div className="ph-right-col">

            {/* Quick Actions */}
            <div className="ph-quick-actions">
              <button className="ph-quick-action ph-quick-action--primary">
                <div className="ph-quick-action__icon"><ClipboardList size={22} /></div>
                <div className="ph-quick-action__text">
                  <span className="ph-quick-action__title">Log Exercise</span>
                  <span className="ph-quick-action__desc">Report today's session</span>
                </div>
              </button>
              <button className="ph-quick-action ph-quick-action--secondary">
                <div className="ph-quick-action__icon"><Sparkles size={22} /></div>
                <div className="ph-quick-action__text">
                  <span className="ph-quick-action__title">AI Search</span>
                  <span className="ph-quick-action__desc">Ask about your rehab</span>
                </div>
              </button>
            </div>

            {/* Today Plan */}
            <section className="ph-section">
              <div className="ph-section__header">
                <h2 className="ph-section__title">Today Plan</h2>
                <button className="ph-section__view-all">View All</button>
              </div>
              <div className="ph-exercise-list">
                {exercises.map(ex => <ExerciseItem key={ex.id} exercise={ex} />)}
              </div>
            </section>

          </div>
        </div>

      </main>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="ph-bottom-nav">
        {bottomNav.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`ph-bottom-nav__item${active ? ' ph-bottom-nav__item--active' : ''}`}
            aria-label={label}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}
