import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import './MyPlan.css'
import TopNav from '@/components/TopNav'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useGetMyPlan } from '@/hooks/paitent/useGetMyPlan'
import { useGetWeeklyPlan } from '@/hooks/paitent/useGetWeeklyPlan'
import type { MyPlan } from '@/types/patient'
import ExerciseCard from '@/components/ExerciseCard'


export default function MyPlanPage() {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)
  const { data, isLoading, error } = useGetMyPlan()
  const [showWeeklyView, setShowWeeklyView] = useState(false)
  const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklyPlan(showWeeklyView)

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
      <TopNav />

      <main className="mp-main">
        <div className="mp-title-row">
          <div className="mp-title-group">
          <button className="mp-back-btn" type="button" onClick={() => navigate('/patient')} aria-label="Back to home">
            <ChevronLeft size={20} />
          </button>
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
          </div>
          <div className="mp-title-actions">
            <button className="mp-new-btn" type="button" onClick={() => navigate('/patient/schedule-exercise')}>
              <Plus size={15} />
              New Weekly Plan
            </button>
          </div>
        </div>

        <div className="mp-plan-grid">
          {/* Today */}
          <section className="mp-section">
            <div className="mp-section__header">
              <h2 className="mp-section__title">Today plan</h2>
              <button
                className="mp-section__view-all"
                type="button"
                onClick={() => setShowWeeklyView(v => !v)}
                aria-expanded={showWeeklyView}
              >
                {showWeeklyView ? (
                  <>Show Less <ChevronUp size={13} className="mp-section__view-all-icon" /></>
                ) : (
                  <>View All <ChevronDown size={13} className="mp-section__view-all-icon" /></>
                )}
              </button>
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
              <div className="mp-section__title-group">
                <h2 className="mp-section__title">Tomorrow plan</h2>
              </div>
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
                  <ExerciseCard key={ex.exercise_id} exercise={ex} tomorrow />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Weekly view — expands when "View All" is clicked */}
        <div className={`mp-week-view${showWeeklyView ? ' mp-week-view--visible' : ''}`}>
          <div className="mp-week-view__inner">
            <h2 className="mp-week-view__title">Rest of This Week</h2>

            {weeklyLoading && (
              <p className="mp-empty__text">Loading weekly schedule…</p>
            )}

            {!weeklyLoading && weeklyData && weeklyData.days.length === 0 && (
              <div className="mp-empty">
                <span className="mp-empty__icon">🏖️</span>
                <p className="mp-empty__text">No more exercises scheduled this week.</p>
              </div>
            )}

            {!weeklyLoading && weeklyData && weeklyData.days.map(day => (
              <div key={day.date} className="mp-week-day">
                <div className="mp-week-day__header">
                  <span className="mp-week-day__label">{day.day_label}</span>
                  <span className="mp-week-day__pill">
                    {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mp-section__list">
                  {day.exercises.map(ex => (
                    <ExerciseCard key={`${day.date}-${ex.exercise_id}`} exercise={ex} tomorrow />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
