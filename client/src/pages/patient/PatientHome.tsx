import { Bell, Menu } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import './PatientHome.css'

import ExerciseItem from './components/ExerciseItem'
import CalendarCard from './components/CalendarCard'
import { exercises, completedCount, progressPercent, stats, bottomNav, topNav } from './patient.constants'

export default function PatientHome() {
  const user = useAtomValue(authAtom)

  return (
    <div className="ph-page">

      {/* ── Header ── */}
      <header className="ph-header">
        <div className="ph-header__logo">
          <img src="/logo.svg" alt="Rehab360" className="ph-header__logo-img" />
          <span className="ph-header__brand">Rehab<span>360</span></span>
        </div>

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
            <h1 className="ph-greeting">Hello, {user?.first_name || 'Placeholder'} 👋</h1>
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
        <div className="ph-progress-card">
          <div className="ph-progress-card__header">
            <span className="ph-progress-card__label">Today's Progress</span>
            <span className="ph-progress-card__percent">{progressPercent}%</span>
          </div>
          <div className="ph-progress-card__bar-track">
            <div
              className="ph-progress-card__bar-fill"
              style={{ '--ph-progress': `${progressPercent}%` } as React.CSSProperties}
            />
          </div>
          <p className="ph-progress-card__sub">{completedCount} of {exercises.length} exercises completed</p>
        </div>

        {/* Desktop two-col grid: Calendar + Today Plan */}
        <div className="ph-mid-grid">
          <CalendarCard />

          <div className="ph-right-col">
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
