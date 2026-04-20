import { Plus, CheckCircle2, Circle, X, Bell } from 'lucide-react'
import type { PlanExercise } from '../../MyPlan'
import type { ScheduledExercise } from '../ExerciseSchedule'

const SETS: Array<1 | 2 | 3> = [1, 2, 3]
const TIMES = ['Morning', 'Afternoon', 'Evening'] as const

interface DayCardProps {
  dayName: string
  exercises: ScheduledExercise[]
  allExercises: PlanExercise[]
  remindersEnabled: boolean
  onAddClick: () => void
  onRemove: (exerciseId: number) => void
  onUpdateSets: (exerciseId: number, sets: 1 | 2 | 3) => void
  onUpdateTime: (exerciseId: number, timeOfDay: 'Morning' | 'Afternoon' | 'Evening') => void
  onUpdateReminderDate: (exerciseId: number, date: string) => void
  onUpdateReminderTime: (exerciseId: number, time: string) => void
  showValidation: boolean
}

export default function DayCard({
  dayName,
  exercises,
  allExercises,
  remindersEnabled,
  onAddClick,
  onRemove,
  onUpdateSets,
  onUpdateTime,
  onUpdateReminderDate,
  onUpdateReminderTime,
  showValidation,
}: DayCardProps) {
  const hasExercises = exercises.length > 0

  function getExercise(id: number) {
    return allExercises.find(e => e.id === id)
  }

  return (
    <article className={`es-day-card${hasExercises ? ' es-day-card--has-exercises' : ''}`}>
      <header className="es-day-card__header">
        <span className="es-day-card__day-name">{dayName}</span>
        {hasExercises
          ? <CheckCircle2 size={18} className="es-day-card__check es-day-card__check--done" aria-label="Day has exercises" />
          : <Circle size={18} className="es-day-card__check" aria-label="No exercises yet" />
        }
      </header>

      {hasExercises && (
        <ul className="es-day-card__list" aria-label={`Exercises for ${dayName}`}>
          {exercises.map(entry => {
            const ex = getExercise(entry.exerciseId)
            if (!ex) return null
            const reminderMissing =
              showValidation && remindersEnabled && (!entry.reminderDate || !entry.reminderTime)

            return (
              <li key={entry.exerciseId} className="es-ex-row">
                <div className="es-ex-row__top">
                  <div
                    className="es-ex-row__dot"
                    style={{ background: `linear-gradient(135deg, ${ex.thumb.from}, ${ex.thumb.to})` }}
                    aria-hidden
                  />
                  <span className="es-ex-row__name">{ex.name}</span>
                  <button
                    className="es-ex-row__remove"
                    onClick={() => onRemove(entry.exerciseId)}
                    aria-label={`Remove ${ex.name} from ${dayName}`}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Sets */}
                <div className="es-ex-row__setting">
                  <span className="es-ex-row__setting-label">Sets</span>
                  <div className="es-pill-group" role="group" aria-label="Number of sets">
                    {SETS.map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`es-pill${entry.sets === n ? ' es-pill--active' : ''}`}
                        onClick={() => onUpdateSets(entry.exerciseId, n)}
                        aria-pressed={entry.sets === n}
                        aria-label={`${n} set${n > 1 ? 's' : ''}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time of Day */}
                <div className="es-ex-row__setting">
                  <span className="es-ex-row__setting-label">Time</span>
                  <div className="es-pill-group" role="group" aria-label="Time of day">
                    {TIMES.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`es-pill${entry.timeOfDay === t ? ' es-pill--active' : ''}`}
                        onClick={() => onUpdateTime(entry.exerciseId, t)}
                        aria-pressed={entry.timeOfDay === t}
                        aria-label={t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reminder */}
                <div className={`es-reminder${remindersEnabled ? '' : ' es-reminder--disabled'}`}>
                  <span className="es-reminder__label">
                    <Bell size={13} aria-hidden />
                    Set reminder
                  </span>
                  <div className="es-reminder__fields">
                    <input
                      type="date"
                      className="es-reminder__input"
                      value={entry.reminderDate}
                      onChange={e => onUpdateReminderDate(entry.exerciseId, e.target.value)}
                      disabled={!remindersEnabled}
                      aria-label={`Reminder date for ${ex.name}`}
                    />
                    <input
                      type="time"
                      className="es-reminder__input"
                      value={entry.reminderTime}
                      onChange={e => onUpdateReminderTime(entry.exerciseId, e.target.value)}
                      disabled={!remindersEnabled}
                      aria-label={`Reminder time for ${ex.name}`}
                    />
                  </div>
                  {reminderMissing && (
                    <p className="es-reminder__warning" role="alert">
                      ⚠ Please set a reminder date and time
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <button
        className="es-day-card__add-btn"
        onClick={onAddClick}
        type="button"
        aria-label={`Add exercise to ${dayName}`}
      >
        <Plus size={15} aria-hidden />
        Add exercise
      </button>
    </article>
  )
}
