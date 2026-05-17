import { useState, useMemo } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import ExerciseCard from './components/ExerciseCard'
import DayCard from './components/DayCard'
import ReminderToggle from './components/ReminderToggle'
import CalendarLinksModal, { type CalendarItem } from './components/CalendarLinksModal'
import './ExerciseSchedule.css'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import PatientTopNav from '@/components/PatientTopNav'
import { useNavigate } from 'react-router-dom'
import { useGetWeeklySchedule } from '@/hooks/paitent/useGetWeeklySchedule'
import { useSaveWeeklySchedule } from '@/hooks/paitent/useSaveWeeklySchedule'

/* ── Types ── */
export interface ScheduledExercise {
  exerciseId: number
  reminderDate: string
  reminderTime: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ── Page ── */
export default function ExerciseSchedule() {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)
  const { data = [] } = useGetWeeklySchedule()
  const saveSchedule = useSaveWeeklySchedule()

  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [pickerDay, setPickerDay] = useState<number | null>(null)
  const [pickerSelected, setPickerSelected] = useState<Set<number>>(new Set())
  const [showValidation, setShowValidation] = useState(false)
  const [calendarItems, setCalendarItems] = useState<CalendarItem[] | null>(null)
  const [showUnscheduledConfirm, setShowUnscheduledConfirm] = useState(false)

  // dayIndex → Set of exercise IDs the user has explicitly chosen for that day.
  // undefined means "not yet customised" → show all daily exercises by default.
  const [explicitSelection, setExplicitSelection] = useState<Record<number, Set<number>>>({})
  // Reminder data keyed by `${dayIndex}-${exerciseId}`
  const [reminderData, setReminderData] = useState<Record<string, { reminderDate: string; reminderTime: string }>>({})

  /* ── Derive effective schedule during render (no setState-in-effect) ── */
  const schedule = useMemo((): Record<number, ScheduledExercise[]> => {
    const dailyIds = data
      .filter(ex => ex.time_unit?.toLowerCase() === 'daily')
      .map(ex => ex.exercise_id)
    const result: Record<number, ScheduledExercise[]> = {}
    for (let day = 0; day < 7; day++) {
      const selected = explicitSelection[day]
      const ids = selected !== undefined ? [...selected] : dailyIds
      result[day] = ids.map(id => {
        const key = `${day}-${id}`
        const r = reminderData[key] ?? { reminderDate: '', reminderTime: '' }
        return { exerciseId: id, reminderDate: r.reminderDate, reminderTime: r.reminderTime }
      })
    }
    return result
  }, [data, explicitSelection, reminderData])

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
    setExplicitSelection(prev => ({ ...prev, [pickerDay]: new Set(pickerSelected) }))
    closePicker()
  }

  function removeExercise(dayIndex: number, exerciseId: number) {
    setExplicitSelection(prev => {
      const dailyIds = data
        .filter(ex => ex.time_unit?.toLowerCase() === 'daily')
        .map(ex => ex.exercise_id)
      const current = prev[dayIndex] ?? new Set(dailyIds)
      const next = new Set(current)
      next.delete(exerciseId)
      return { ...prev, [dayIndex]: next }
    })
    setReminderData(prev => {
      const key = `${dayIndex}-${exerciseId}`
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function updateEntry(
    dayIndex: number,
    exerciseId: number,
    patch: Partial<Omit<ScheduledExercise, 'exerciseId'>>
  ) {
    const key = `${dayIndex}-${exerciseId}`
    setReminderData(prev => {
      const current = prev[key] ?? { reminderDate: '', reminderTime: '' }
      return {
        ...prev,
        [key]: {
          reminderDate: patch.reminderDate !== undefined ? patch.reminderDate : current.reminderDate,
          reminderTime: patch.reminderTime !== undefined ? patch.reminderTime : current.reminderTime,
        },
      }
    })
  }

  /* ── Validation & save ── */
  const totalExercises = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0)
  const isSaveDisabled = totalExercises === 0

  const scheduledIds = new Set(Object.values(schedule).flat().map(e => e.exerciseId))
  const unscheduledExercises = data.filter(ex => !scheduledIds.has(ex.exercise_id))

  function doSave() {
    setCalendarItems(null)
    setShowValidation(false)
    saveSchedule.mutate({
      reminders_enabled: remindersEnabled,
      schedule: Object.entries(schedule).flatMap(([dayIndex, entries]) =>
        entries.map(e => {
          const ex = data.find(d => d.exercise_id === e.exerciseId)
          return {
            exercise_id: e.exerciseId,
            day_index: Number(dayIndex),
            sets: ex?.num_sets ?? 1,
            reminder_date: e.reminderDate || null,
            reminder_time: remindersEnabled ? (e.reminderTime || null) : null,
            session_id: ex?.session_id ?? undefined,
            plan_id: ex?.plan_id ?? undefined,
          }
        })
      ),
    })
  }

  function openCalendarOrSave() {
    if (remindersEnabled) {
      const items: CalendarItem[] = Object.values(schedule)
        .flat()
        .filter(e => e.reminderDate && e.reminderTime)
        .map(e => {
          const ex = data.find(d => d.exercise_id === e.exerciseId)
          return {
            exerciseName: ex?.exercise_name ?? `Exercise ${e.exerciseId}`,
            date: e.reminderDate,
            time: e.reminderTime,
            sets: ex?.num_sets ?? 1,
          }
        })
      setShowValidation(false)
      setCalendarItems(items)
    } else {
      doSave()
    }
  }

  function handleUnscheduledConfirm() {
    setShowUnscheduledConfirm(false)
    openCalendarOrSave()
  }

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
    } else {
      const hasMissingDate = Object.values(schedule).some(day =>
        day.some(e => !e.reminderDate)
      )
      if (hasMissingDate) {
        setShowValidation(true)
        return
      }
    }

    if (unscheduledExercises.length > 0) {
      setShowUnscheduledConfirm(true)
      return
    }

    openCalendarOrSave()
  }

  return (
    <div className="es-page">

      {/* ── Header ── */}
      <PatientTopNav patientName={user?.first_name} />

      <main className="es-main">

        {/* ── Back button ── */}
        <button className="es-back-btn" onClick={() => navigate('/patient/my-plan')} type="button" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>

        {/* ── Page title ── */}
        <div className="es-page-header">
          <h1 className="es-page-title">Weekly Schedule</h1>
          <p className="es-page-sub">Plan your exercises for each day</p>
        </div>

        {/* ── Exercise Pool ── */}
        <section aria-labelledby="pool-title">
          <div className="es-section-header">
            <h2 className="es-section-title" id="pool-title">Available Exercises</h2>
            <span className="es-section-sub">Prescribed by your healthcare professional</span>
          </div>
          <div className="es-pool" role="list" aria-label="Available exercises">
            {data.map(ex => (
              <div key={ex.exercise_id} role="listitem">
                <ExerciseCard exercise={ex} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Weekly Schedule ── */}
        <section>
          <div className="es-week-grid">
            {DAYS.map((day, idx) => (
              <DayCard
                key={day}
                dayName={day}
                exercises={getDay(idx)}
                allExercises={data}
                remindersEnabled={remindersEnabled}
                onAddClick={() => openPicker(idx)}
                onRemove={exId => removeExercise(idx, exId)}
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

      {/* ── Calendar Links Modal ── */}
      {calendarItems !== null && (
        <CalendarLinksModal
          items={calendarItems}
          onSave={doSave}
          onClose={() => setCalendarItems(null)}
        />
      )}

      {/* ── Unscheduled Exercises Confirmation ── */}
      {showUnscheduledConfirm && (
        <div
          className="es-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unscheduled-title"
        >
          <div className="es-modal">
            <header className="es-modal__header">
              <h3 className="es-modal__title" id="unscheduled-title">
                Some exercises are unscheduled
              </h3>
            </header>
            <div className="es-modal__body">
              <p className="es-modal__desc">
                The following exercises haven't been added to any day. Are you sure you want to save without them?
              </p>
              <ul className="es-modal__unscheduled-list">
                {unscheduledExercises.map(ex => (
                  <li key={ex.exercise_id} className="es-modal__unscheduled-item">
                    {ex.exercise_name}
                  </li>
                ))}
              </ul>
            </div>
            <footer className="es-modal__footer">
              <button
                className="es-modal__cancel"
                onClick={() => setShowUnscheduledConfirm(false)}
                type="button"
              >
                Go back
              </button>
              <button
                className="es-modal__confirm"
                onClick={handleUnscheduledConfirm}
                type="button"
              >
                Save anyway
              </button>
            </footer>
          </div>
        </div>
      )}

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
              {data.map(ex => {
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
                        <span className="es-modal__ex-desc">
                          {[
                            `${ex.num_sets} sets · ${ex.reps} reps`,
                            (ex.weight ?? 0) > 0 ? `${ex.weight} kg` : null,
                            (ex.time_duration ?? 0) > 0 ? `${ex.time_duration} ${ex.time_unit?.toLowerCase()}` : null,
                          ].filter(Boolean).join(' · ')}
                        </span>
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
