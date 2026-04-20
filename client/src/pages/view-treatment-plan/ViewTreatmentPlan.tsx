import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Target, Dumbbell, Stethoscope, CalendarDays, FileText } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import type { PlanFormState } from '@/pages/create-treatment-plan/CreateTreatmentPlan'
import type { ExerciseEntry } from '@/pages/create-treatment-plan/AddExerciseModal'

import '../patient-details/PatientDetails.css'
import '../visit-summary-detail/VisitSummaryDetail.css'
import './ViewTreatmentPlan.css'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_DIAGNOSIS = 'Shoulder Impingement'

const MOCK_PLAN_RECENT: PlanFormState = {
  goal: 'Restore full range of motion in the shoulder and return to pain-free daily activities within 8 weeks.',
  start_date: '2025-01-06',
  end_date: '2025-03-01',
  notes: 'Patient should rest between sessions. Stop immediately if sharp pain occurs during any exercise. Apply ice 15 minutes post-session.',
}

const MOCK_EXERCISES_RECENT: ExerciseEntry[] = [
  {
    id: '1',
    name: 'Wall Squats',
    sets: 3,
    reps: 12,
    weight: 0,
    frequencyAmount: 3,
    frequencyUnit: 'Weekly',
    description: 'Keep back flat against the wall. Lower slowly to 90 degrees.',
  },
  {
    id: '2',
    name: 'Hip Bridge',
    sets: 3,
    reps: 15,
    weight: 0,
    frequencyAmount: 5,
    frequencyUnit: 'Weekly',
    description: '',
  },
  {
    id: '3',
    name: 'Plank',
    sets: 3,
    reps: 1,
    weight: 0,
    frequencyAmount: 4,
    frequencyUnit: 'Weekly',
    description: 'Hold for 30 seconds per set. Keep core tight throughout.',
  },
]

// Plan keyed by planId — simulates fetching a specific plan
const MOCK_PLANS: Record<string, { plan: PlanFormState; exercises: ExerciseEntry[] }> = {
  '1': {
    plan: MOCK_PLAN_RECENT,
    exercises: MOCK_EXERCISES_RECENT,
  },
  '2': {
    plan: {
      goal: 'Improve core stability and reduce lower-back pain through targeted strengthening.',
      start_date: '2024-10-01',
      end_date: '2024-12-15',
      notes: '',
    },
    exercises: [
      {
        id: 'a',
        name: 'Bicycle Crunch',
        sets: 3,
        reps: 20,
        weight: 0,
        frequencyAmount: 3,
        frequencyUnit: 'Weekly',
        description: 'Slow and controlled — do not pull on the neck.',
      },
      {
        id: 'b',
        name: 'Deadlift',
        sets: 4,
        reps: 8,
        weight: 40,
        frequencyAmount: 2,
        frequencyUnit: 'Weekly',
        description: '',
      },
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ViewTreatmentPlan() {
  const navigate = useNavigate()
  const { planId } = useParams<{ id: string; planId?: string }>()
  const auth = useAtomValue(authAtom)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Scenario A: planId present → load that specific historical plan.
  // Scenario B: no planId (entry from patient profile) → most recent plan.
  const entry =
    planId && MOCK_PLANS[planId]
      ? MOCK_PLANS[planId]
      : MOCK_PLANS[Object.keys(MOCK_PLANS)[0]]

  const plan = entry.plan
  const exercises = entry.exercises

  return (
    <div className="vtp-page">
      <TopNav doctorName={auth?.first_name ?? 'Cohen'} />

      <main className="pt-16">
        {/* ── Back navigation ── */}
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Treatment Plan</h1>
        </div>

        <div className="vtp-body">

          {/* ── Plan Details ── */}
          <div className="vsd-card">
            <div className="vsd-card__header">
              <Stethoscope size={18} className="vsd-card__icon" />
              <h2 className="vsd-card__title">Plan Details</h2>
            </div>

            {/* Medical Diagnosis */}
            <div className="vsd-fields">
              <div className="vsd-field-block">
                <span className="vsd-field-block__label">Medical Diagnosis</span>
                <p className="vsd-field-block__text">{MOCK_DIAGNOSIS}</p>
              </div>
            </div>

            <hr className="vsd-divider" />

            {/* Duration */}
            <div className="vsd-detail-grid">
              <span className="vsd-detail-grid__label">
                <CalendarDays size={13} className="vtp-inline-icon" />
                Start Date
              </span>
              <span className="vsd-detail-grid__value">{formatDate(plan.start_date)}</span>

              <span className="vsd-detail-grid__label">
                <CalendarDays size={13} className="vtp-inline-icon" />
                End Date
              </span>
              <span className="vsd-detail-grid__value">{formatDate(plan.end_date)}</span>
            </div>

            <hr className="vsd-divider" />

            {/* General Notes */}
            <div className="vsd-fields">
              <div className={`vsd-field-block${plan.notes ? ' vsd-field-block--accent' : ''}`}>
                <span className="vsd-field-block__label">
                  <FileText size={11} className="vtp-inline-icon" />
                  General Notes
                </span>
                {plan.notes ? (
                  <p className="vsd-field-block__text">{plan.notes}</p>
                ) : (
                  <p className="vtp-empty-notes">No additional notes provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Treatment Goal ── */}
          <div className="vtp-goal-card">
            <div className="vtp-goal-card__header">
              <Target size={16} className="vtp-goal-card__icon" />
              <span className="vtp-goal-card__title">Treatment Goal</span>
            </div>
            <p className="vtp-goal-text">{plan.goal}</p>
          </div>

          {/* ── Exercises ── */}
          <div className="vsd-card">
            <div className="vsd-card__header">
              <Dumbbell size={18} className="vsd-card__icon" />
              <h2 className="vsd-card__title">Exercises</h2>
              {exercises.length > 0 && (
                <span className="vtp-count">{exercises.length}</span>
              )}
            </div>

            {exercises.length === 0 ? (
              <p className="vtp-empty">No exercises added to this plan.</p>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="vtp-table-wrap">
                  <table className="vtp-ex-table">
                    <thead>
                      <tr>
                        <th>Exercise</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Weight</th>
                        <th>Frequency</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="vtp-ex-table__name">{ex.name}</td>
                          <td>{ex.sets}</td>
                          <td>{ex.reps}</td>
                          <td>{ex.weight > 0 ? `${ex.weight} kg` : '—'}</td>
                          <td>{ex.frequencyAmount}× {ex.frequencyUnit}</td>
                          <td className="vtp-ex-table__desc">{ex.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <ul className="vtp-ex-cards">
                  {exercises.map((ex) => (
                    <li key={ex.id} className="vtp-ex-card">
                      <p className="vtp-ex-card__name">{ex.name}</p>
                      <div className="vtp-ex-card__grid">
                        <span className="vtp-ex-card__label">Sets</span>
                        <span className="vtp-ex-card__value">{ex.sets}</span>

                        <span className="vtp-ex-card__label">Reps</span>
                        <span className="vtp-ex-card__value">{ex.reps}</span>

                        <span className="vtp-ex-card__label">Weight</span>
                        <span className="vtp-ex-card__value">
                          {ex.weight > 0 ? `${ex.weight} kg` : '—'}
                        </span>

                        <span className="vtp-ex-card__label">Frequency</span>
                        <span className="vtp-ex-card__value">
                          {ex.frequencyAmount}× {ex.frequencyUnit}
                        </span>

                        {ex.description && (
                          <>
                            <span className="vtp-ex-card__label">Instructions</span>
                            <span className="vtp-ex-card__value">{ex.description}</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
