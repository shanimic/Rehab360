import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Home, Dumbbell, BarChart2, MessageSquare, Search as SearchIcon,
} from 'lucide-react'
import './MyPlan.css'
import PatientTopNav from '@/components/PatientTopNav'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useGetMyPlan } from '@/hooks/paitent/useGetMyPlan'
import type { MyPlan } from '@/types/patient'
import ExerciseCard from '@/components/ExerciseCard'

const bottomNav = [
  { label: 'Home', icon: Home, active: false },
  { label: 'Exercises', icon: Dumbbell, active: true },
  { label: 'Analytics', icon: BarChart2, active: false },
  { label: 'Chats', icon: MessageSquare, active: false },
  { label: 'Search', icon: SearchIcon, active: false },
]


export default function MyPlanPage() {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)
  const { data, isLoading, error } = useGetMyPlan()

  const todayActive = data?.today_exercises.filter(ex => !ex.execution_status) ?? []
  const todayCompleted = data?.today_exercises.filter(ex => ex.execution_status) ?? []
  const tomorrowExercises = data?.tomorrow_exercises ?? []

  function openReport(exercise: MyPlan) {
    navigate(`/patient/exercise/${exercise.exercise_id}`, {
      state: { exercise, source: 'today' },
    })
  }

  return (
    <div className="mp-page pt-16">
      <PatientTopNav patientName={user?.first_name} />

      <main className="mp-main">
        <div className="mp-title-row">
          <div className="mp-title-left">
            <h1 className="mp-title">My Plan</h1>
            {!isLoading && (
              <span className="mp-title-sub">
                {todayActive.length === 0
                  ? 'All exercises reported today!'
                  : `${todayActive.length} exercise${todayActive.length !== 1 ? 's' : ''} remaining today`}
              </span>
            )}
          </div>
          <div className="mp-title-actions">
            <button className="mp-new-btn" type="button" onClick={() => navigate('/patient/schedule-exercise')}>
              <Plus size={15} />
              New
            </button>
          </div>
        </div>

        <div className="mp-plan-grid">
          {/* Today */}
          <section className="mp-section">
            <div className="mp-section__header">
              <h2 className="mp-section__title">Today plan</h2>
              <button className="mp-section__view-all" type="button">View All</button>
            </div>

            {isLoading && <p className="mp-empty__text">Loading exercises…</p>}

            {error && <p className="mp-empty__text">Failed to load exercises.</p>}

            {!isLoading && !error && todayActive.length === 0 && todayCompleted.length === 0 && (
              <div className="mp-empty">
                <span className="mp-empty__icon">🎉</span>
                <p className="mp-empty__text">All done for today!</p>
              </div>
            )}

            {!isLoading && !error && (todayActive.length > 0 || todayCompleted.length > 0) && (
              <div className="mp-section__list">
                {todayActive.map(ex => (
                  <ExerciseCard key={ex.exercise_id} exercise={ex} onClick={() => openReport(ex)} />
                ))}
                {todayCompleted.map(ex => (
                  <ExerciseCard key={ex.exercise_id} exercise={ex} completed />
                ))}
              </div>
            )}
          </section>

          {/* Tomorrow */}
          <section className="mp-section">
            <div className="mp-section__header">
              <h2 className="mp-section__title">Tomorrow plan</h2>
            </div>

            {isLoading && <p className="mp-empty__text">Loading exercises…</p>}

            {!isLoading && !error && tomorrowExercises.length === 0 && (
              <div className="mp-empty">
                <span className="mp-empty__icon">📅</span>
                <p className="mp-empty__text">No exercises scheduled for tomorrow.</p>
              </div>
            )}

            {!isLoading && !error && tomorrowExercises.length > 0 && (
              <div className="mp-section__list">
                {tomorrowExercises.map(ex => (
                  <ExerciseCard key={ex.exercise_id} exercise={ex} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="mp-bottom-nav">
        {bottomNav.map(({ label, icon: Icon, active: isActive }) => (
          <button
            key={label}
            className={`mp-bottom-nav__item${isActive ? ' mp-bottom-nav__item--active' : ''}`}
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
