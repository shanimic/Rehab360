import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { VisitType, type MyPlan } from '@/types/patient'
import ExerciseCard from './components/ExerciseCard'
import DayCard from './components/DayCard'
import ReminderToggle from './components/ReminderToggle'
import './ExerciseSchedule.css'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import PatientTopNav from '@/components/PatientTopNav'

/* ── Types ── */
export interface ScheduledExercise {
  exerciseId: number
  sets: 1 | 2 | 3
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening'
  reminderDate: string
  reminderTime: string
}

/* ── Static exercise pool (defined by healthcare professional) ── */
const EXERCISE_POOL: MyPlan[] = [
  { exercise_id: 1, exercise_name: 'Push Up',        visit_type: VisitType.PHYSIOTHERAPIST, reps: 100, execution_status: false, text_instructions: '3 sets · 100 reps' },
  { exercise_id: 2, exercise_name: 'Sit Up',         visit_type: VisitType.FITNESS,         reps: 20,  execution_status: false, text_instructions: '2 sets · 20 reps' },
  { exercise_id: 3, exercise_name: 'Knee Push Up',   visit_type: VisitType.PHYSIOTHERAPIST, reps: 20,  execution_status: false, text_instructions: '2 sets · 20 reps' },
  { exercise_id: 4, exercise_name: 'Shoulder Stretch',visit_type: VisitType.PHYSIOTHERAPIST, reps: 15,  execution_status: false, text_instructions: '3 sets · 15 reps each side' },
  { exercise_id: 5, exercise_name: 'Squat',          visit_type: VisitType.FITNESS,         reps: 15,  execution_status: false, text_instructions: '3 sets · 15 reps' },
  { exercise_id: 6, exercise_name: 'Plank',          visit_type: VisitType.PHYSIOTHERAPIST, reps: 30,  execution_status: false, text_instructions: '3 sets · 30 seconds' },
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ── Page ── */
export default function ExerciseSchedule() {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)

  // dayIndex (0–6) → array of scheduled exercises
  const [schedule, setSchedule] = useState<Record<number, ScheduledExercise[]>>({})
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [pickerDay, setPickerDay] = useState<number | null>(null)
  const [pickerSelected, setPickerSelected] = useState<Set<number>>(new Set())
  const [showValidation, setShowValidation] = useState(false)

  /* ── Helpers ── */
  function getDay(dayIndex: number): ScheduledExercise[] {
    return schedule[dayIndex] ?? []
  }

  function openPicker(dayIndex: number) {
    const current = new Set(getDay(dayIndex).map(e => e.exerciseId))
    setPickerSelected(current)
    setPickerDay(dayIndex)
  }

  function closePicker() {
    setPickerDay(null)
    setPickerSelected(new Set())
  }

  function togglePickerExercise(id: number) {
    setPickerSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function confirmPicker() {
    if (pickerDay === null) return
    const existing = getDay(pickerDay)
    const existingMap = new Map(existing.map(e => [e.exerciseId, e]))

    const next: ScheduledExercise[] = [...pickerSelected].map(id =>
      existingMap.get(id) ?? {
        exerciseId: id,
        sets: 1,
        timeOfDay: 'Morning',
        reminderDate: '',
        reminderTime: '',
      }
    )
    setSchedule(prev => ({ ...prev, [pickerDay]: next }))
    closePicker()
  }

  function removeExercise(dayIndex: number, exerciseId: number) {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: (prev[dayIndex] ?? []).filter(e => e.exerciseId !== exerciseId),
    }))
  }

  function updateEntry(
    dayIndex: number,
    exerciseId: number,
    patch: Partial<Omit<ScheduledExercise, 'exerciseId'>>
  ) {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: (prev[dayIndex] ?? []).map(e =>
        e.exerciseId === exerciseId ? { ...e, ...patch } : e
      ),
    }))
  }

  /* ── Validation & save ── */
  const totalExercises = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0)
  const isSaveDisabled = totalExercises === 0

  function handleSave() {
    if (isSaveDisabled) return

    if (remindersEnabled) {
      const hasMissingReminder = Object.values(schedule).some(day =>
        day.some(e => !e.reminderDate || !e.reminderTime)
      )
      if (hasMissingReminder) {
        setShowValidation(true)
        return
      }
    }

    // TODO: persist schedule to API
    setShowValidation(false)
    navigate(-1)
  }

  return (
    <div className="es-page">

      {/* ── Header ── */}
      <PatientTopNav patientName={user?.first_name} />

      <main className="es-main">

        {/* ── Exercise Pool ── */}
        <section aria-labelledby="pool-title">
          <div className="es-section-header">
            <h2 className="es-section-title" id="pool-title">Available Exercises</h2>
            <span className="es-section-sub">Prescribed by your healthcare professional</span>
          </div>
          <div className="es-pool" role="list" aria-label="Available exercises">
            {EXERCISE_POOL.map(ex => (
              <div key={ex.exercise_id} role="listitem">
                <ExerciseCard exercise={ex} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Weekly Schedule ── */}
        <section aria-labelledby="schedule-title">
          <div className="es-section-header">
            <h2 className="es-section-title" id="schedule-title">Weekly Schedule</h2>
            <span className="es-section-sub">Plan your exercises for each day</span>
          </div>
          <div className="es-week-grid">
            {DAYS.map((day, idx) => (
              <DayCard
                key={day}
                dayName={day}
                exercises={getDay(idx)}
                allExercises={EXERCISE_POOL}
                remindersEnabled={remindersEnabled}
                onAddClick={() => openPicker(idx)}
                onRemove={exId => removeExercise(idx, exId)}
                onUpdateSets={(exId, sets) => updateEntry(idx, exId, { sets })}
                onUpdateTime={(exId, timeOfDay) => updateEntry(idx, exId, { timeOfDay })}
                onUpdateReminderDate={(exId, date) => updateEntry(idx, exId, { reminderDate: date })}
                onUpdateReminderTime={(exId, time) => updateEntry(idx, exId, { reminderTime: time })}
                showValidation={showValidation}
              />
            ))}
          </div>
        </section>

        {/* ── Reminder Toggle ── */}
        <ReminderToggle enabled={remindersEnabled} onChange={setRemindersEnabled} />

        {/* ── Save Button ── */}
        <button
          className="es-save-btn"
          onClick={handleSave}
          disabled={isSaveDisabled}
          type="button"
          aria-disabled={isSaveDisabled}
        >
          Save Schedule
        </button>

      </main>

      {/* ── Exercise Picker Modal ── */}
      {pickerDay !== null && (
        <div
          className="es-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="picker-title"
          onClick={e => { if (e.target === e.currentTarget) closePicker() }}
        >
          <div className="es-modal">
            <header className="es-modal__header">
              <h3 className="es-modal__title" id="picker-title">
                Add exercise — {DAYS[pickerDay]}
              </h3>
              <button
                className="es-modal__close"
                onClick={closePicker}
                aria-label="Close exercise picker"
                type="button"
              >
                <X size={18} />
              </button>
            </header>

            <ul className="es-modal__list" aria-label="Select exercises">
              {EXERCISE_POOL.map(ex => {
                const checked = pickerSelected.has(ex.exercise_id)
                const isPhysio = ex.visit_type?.toLowerCase() === 'physiotherapist'
                return (
                  <li key={ex.exercise_id}>
                    <label className={`es-modal__item${checked ? ' es-modal__item--checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePickerExercise(ex.exercise_id)}
                        className="es-modal__checkbox"
                        aria-label={ex.exercise_name}
                      />
                      <div
                        className="es-modal__dot"
                        style={{ background: isPhysio ? 'linear-gradient(135deg, #74b9ff, #0984e3)' : 'linear-gradient(135deg, #55efc4, #00b894)' }}
                        aria-hidden
                      />
                      <div className="es-modal__info">
                        <span className="es-modal__ex-name">{ex.exercise_name}</span>
                        <span className="es-modal__ex-desc">{ex.text_instructions}</span>
                      </div>
                      <span
                        className={`es-modal__badge${isPhysio ? ' es-modal__badge--treatment' : ' es-modal__badge--training'}`}
                      >
                        {isPhysio ? 'Physio' : 'Fitness'}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            <footer className="es-modal__footer">
              <button className="es-modal__cancel" onClick={closePicker} type="button">
                Cancel
              </button>
              <button
                className="es-modal__confirm"
                onClick={confirmPicker}
                type="button"
                disabled={pickerSelected.size === 0}
                aria-disabled={pickerSelected.size === 0}
              >
                Done ({pickerSelected.size})
              </button>
            </footer>
          </div>
        </div>
      )}

    </div>
  )
}
