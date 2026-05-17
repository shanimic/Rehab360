import { Plus, CheckCircle2, X, Bell } from 'lucide-react'
import type { WeeklyScheduleItem } from '@/types/patient'
import type { ScheduledExercise } from '../ExerciseSchedule'

interface DayCardProps {
  dayName: string
  exercises: ScheduledExercise[]
  allExercises: WeeklyScheduleItem[]
  remindersEnabled: boolean
  onAddClick: () => void
  onRemove: (exerciseId: number) => void
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
  onUpdateReminderDate,
  onUpdateReminderTime,
  showValidation,
}: DayCardProps) {
  const hasExercises = exercises.length > 0

  function getExercise(id: number) {
    return allExercises.find(e => e.exercise_id === id)
  }

  return (
    <article className={`es-day-card${hasExercises ? ' es-day-card--has-exercises' : ''}`}>
      <header className="es-day-card__header">
        <span className="es-day-card__day-name">{dayName}</span>
        {hasExercises
          ? <CheckCircle2 size={18} className="es-day-card__check es-day-card__check--done" aria-label="Day has exercises" />
          : null
        }
      </header>

      {hasExercises && (
        <ul className="es-day-card__list" aria-label={`Exercises for ${dayName}`}>
          {exercises.map(entry => {
            const ex = getExercise(entry.exerciseId)
            if (!ex) return null
            const reminderMissing =
              showValidation && (
                remindersEnabled
                  ? !entry.reminderDate || !entry.reminderTime
                  : !entry.reminderDate
              )

            return (
              <li key={entry.exerciseId} className="es-ex-row">
                <div className="es-ex-row__top">
                  <div
                    className="es-ex-row__dot"
                    style={{ background: ex.visit_type?.toLowerCase() === 'physiotherapist' ? 'linear-gradient(135deg, #74b9ff, #0984e3)' : 'linear-gradient(135deg, #55efc4, #00b894)' }}
                    aria-hidden
                  />
                  <span className="es-ex-row__name">{ex.exercise_name}</span>
                  <button
                    className="es-ex-row__remove"
                    onClick={() => onRemove(entry.exerciseId)}
                    aria-label={`Remove ${ex.exercise_name} from ${dayName}`}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Reminder */}
                <div className="es-reminder">
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
                      aria-label={`Reminder date for ${ex.exercise_name}`}
                    />
                    {remindersEnabled && (
                      <input
                        type="time"
                        className="es-reminder__input"
                        value={entry.reminderTime}
                        onChange={e => onUpdateReminderTime(entry.exerciseId, e.target.value)}
                        aria-label={`Reminder time for ${ex.exercise_name}`}
                      />
                    )}
                  </div>
                  {reminderMissing && (
                    <p className="es-reminder__warning" role="alert">
                      ⚠ {remindersEnabled ? 'Please set a reminder date and time' : 'Please set a date'}
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
