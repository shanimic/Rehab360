import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Target, Dumbbell, Stethoscope, CalendarDays, FileText } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import { useTreatmentPlanDetails } from '@/hooks/useTreatmentPlan'

import '../patient-details/PatientDetails.css'
import '../visit-summary-detail/VisitSummaryDetail.css'
import './ViewTreatmentPlan.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function PageShell({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="vtp-page">
      <TopNav doctorName="Cohen" />
      <main className="pt-16">
        <div className="patient-nav">
          <button type="button" className="patient-nav__back" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="patient-nav__title">Treatment Plan</h1>
        </div>
        <div className="vtp-body">{children}</div>
      </main>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ViewTreatmentPlan() {
  const navigate = useNavigate()
  const { planId } = useParams<{ id: string; planId?: string }>()
  const auth = useAtomValue(authAtom)

  const { data, isLoading, isError } = useTreatmentPlanDetails(planId ? Number(planId) : undefined)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (isLoading) {
    return (
      <PageShell onBack={() => navigate(-1)}>
        <p className="vsd-state-text">Loading...</p>
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell onBack={() => navigate(-1)}>
        <p className="vsd-state-text vsd-state-text--error">
          Could not load treatment plan. Please try again.
        </p>
      </PageShell>
    )
  }

  return (
    <PageShell onBack={() => navigate(-1)}>

      {/* ── Plan Details ── */}
      <div className="vsd-card">
        <div className="vsd-card__header">
          <Stethoscope size={18} className="vsd-card__icon" />
          <h2 className="vsd-card__title">Plan Details</h2>
        </div>

        <div className="vsd-fields">
          <div className="vsd-field-block">
            <span className="vsd-field-block__label">Medical Diagnosis</span>
            <p className="vsd-field-block__text">{data.medical_diagnosis}</p>
          </div>
        </div>

        <hr className="vsd-divider" />

        <div className="vsd-detail-grid">
          <span className="vsd-detail-grid__label">
            <CalendarDays size={13} className="vtp-inline-icon" />
            Start Date
          </span>
          <span className="vsd-detail-grid__value">{formatDate(data.start_date)}</span>

          <span className="vsd-detail-grid__label">
            <CalendarDays size={13} className="vtp-inline-icon" />
            End Date
          </span>
          <span className="vsd-detail-grid__value">{formatDate(data.end_date)}</span>
        </div>

        <hr className="vsd-divider" />

        <div className="vsd-fields">
          <div className={`vsd-field-block${data.notes ? ' vsd-field-block--accent' : ''}`}>
            <span className="vsd-field-block__label">
              <FileText size={11} className="vtp-inline-icon" />
              General Notes
            </span>
            {data.notes ? (
              <p className="vsd-field-block__text">{data.notes}</p>
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
          <span className="vtp-goal-card__title">
            {auth?.role === 'FITNESS_TRAINER' ? 'Fitness' : 'Treatment'} Goal
          </span>
        </div>
        <p className="vtp-goal-text">{data.goal}</p>
      </div>

      {/* ── Exercises ── */}
      <div className="vsd-card">
        <div className="vsd-card__header">
          <Dumbbell size={18} className="vsd-card__icon" />
          <h2 className="vsd-card__title">Exercises</h2>
          {data.exercises.length > 0 && (
            <span className="vtp-count">{data.exercises.length}</span>
          )}
        </div>

        {data.exercises.length === 0 ? (
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
                  {data.exercises.map((ex) => (
                    <tr key={ex.exercise_id}>
                      <td className="vtp-ex-table__name">{ex.exercise_name}</td>
                      <td>{ex.num_sets ?? '—'}</td>
                      <td>{ex.reps ?? '—'}</td>
                      <td>{ex.weight && ex.weight > 0 ? `${ex.weight} kg` : '—'}</td>
                      <td>
                        {ex.time_duration && ex.time_unit
                          ? `${ex.time_duration}× ${ex.time_unit}`
                          : '—'}
                      </td>
                      <td className="vtp-ex-table__desc">{ex.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="vtp-ex-cards">
              {data.exercises.map((ex) => (
                <li key={ex.exercise_id} className="vtp-ex-card">
                  <p className="vtp-ex-card__name">{ex.exercise_name}</p>
                  <div className="vtp-ex-card__grid">
                    <span className="vtp-ex-card__label">Sets</span>
                    <span className="vtp-ex-card__value">{ex.num_sets ?? '—'}</span>

                    <span className="vtp-ex-card__label">Reps</span>
                    <span className="vtp-ex-card__value">{ex.reps ?? '—'}</span>

                    <span className="vtp-ex-card__label">Weight</span>
                    <span className="vtp-ex-card__value">
                      {ex.weight && ex.weight > 0 ? `${ex.weight} kg` : '—'}
                    </span>

                    <span className="vtp-ex-card__label">Frequency</span>
                    <span className="vtp-ex-card__value">
                      {ex.time_duration && ex.time_unit
                        ? `${ex.time_duration}× ${ex.time_unit}`
                        : '—'}
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

    </PageShell>
  )
}
