import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import type { PlanExercise } from '../MyPlan'
import PatientNavbar from '@/components/PatientNavbar'
import ExerciseCard from './components/ExerciseCard'
import DayCard from './components/DayCard'
import ReminderToggle from './components/ReminderToggle'
import './ExerciseSchedule.css'

/* ── Types ── */
export interface ScheduledExercise {
  exerciseId: number
  sets: 1 | 2 | 3
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening'
  reminderDate: string
  reminderTime: string
}

/* ── Static exercise pool (defined by healthcare professional) ── */
const thumbs = {
  pushUp:   { from: '#ff9a9e', to: '#e84393', iconColor: '#fff' },
  sitUp:    { from: '#2d3436', to: '#636e72', iconColor: '#a78bfa' },
  kneePush: { from: '#74b9ff', to: '#0984e3', iconColor: '#fff' },
  shoulder: { from: '#a29bfe', to: '#6c5ce7', iconColor: '#fff' },
  squat:    { from: '#55efc4', to: '#00b894', iconColor: '#fff' },
  plank:    { from: '#fd79a8', to: '#e17055', iconColor: '#fff' },
}

const EXERCISE_POOL: PlanExercise[] = [
  {
    id: 1,
    name: 'Push Up',
    plan: 'Treatment Plan',
    desc: '3 sets · 100 reps',
    duration: '3 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.pushUp,
  },
  {
    id: 2,
    name: 'Sit Up',
    plan: 'Training Plan',
    desc: '2 sets · 20 reps',
    duration: '5 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.sitUp,
  },
  {
    id: 3,
    name: 'Knee Push Up',
    plan: 'Treatment Plan',
    desc: '2 sets · 20 reps',
    duration: '4 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.kneePush,
  },
  {
    id: 4,
    name: 'Shoulder Stretch',
    plan: 'Treatment Plan',
    desc: '3 sets · 15 reps each side',
    duration: '3 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.shoulder,
  },
  {
    id: 5,
    name: 'Squat',
    plan: 'Training Plan',
    desc: '3 sets · 15 reps',
    duration: '6 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.squat,
  },
  {
    id: 6,
    name: 'Plank',
    plan: 'Treatment Plan',
    desc: '3 sets · 30 seconds',
    duration: '5 minutes',
    imageUrl: '',
    instructions: [],
    thumb: thumbs.plank,
  },
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ── Page ── */
export default function ExerciseSchedule() {
  const navigate = useNavigate()

  // dayIndex (0–6) → array of scheduled exercises
  const [schedule, setSchedule] = useState<Record<number, ScheduledExercise[]>>({})
  const [remindersEnabled, setRemindersEnabled] = useState(false)
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
      <PatientNavbar title="My Exercise Schedule" />

      <main className="es-main">

        {/* ── Exercise Pool ── */}
        <section aria-labelledby="pool-title">
          <div className="es-section-header">
            <h2 className="es-section-title" id="pool-title">Available Exercises</h2>
            <span className="es-section-sub">Prescribed by your healthcare professional</span>
          </div>
          <div className="es-pool" role="list" aria-label="Available exercises">
            {EXERCISE_POOL.map(ex => (
              <div key={ex.id} role="listitem">
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
                const checked = pickerSelected.has(ex.id)
                return (
                  <li key={ex.id}>
                    <label className={`es-modal__item${checked ? ' es-modal__item--checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePickerExercise(ex.id)}
                        className="es-modal__checkbox"
                        aria-label={ex.name}
                      />
                      <div
                        className="es-modal__dot"
                        style={{ background: `linear-gradient(135deg, ${ex.thumb.from}, ${ex.thumb.to})` }}
                        aria-hidden
                      />
                      <div className="es-modal__info">
                        <span className="es-modal__ex-name">{ex.name}</span>
                        <span className="es-modal__ex-desc">{ex.desc}</span>
                      </div>
                      <span
                        className={`es-modal__badge${ex.plan === 'Treatment Plan' ? ' es-modal__badge--treatment' : ' es-modal__badge--training'}`}
                      >
                        {ex.plan === 'Treatment Plan' ? 'Treatment' : 'Training'}
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
