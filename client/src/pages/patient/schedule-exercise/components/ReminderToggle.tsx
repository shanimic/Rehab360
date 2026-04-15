import { Bell } from 'lucide-react'

interface ReminderToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export default function ReminderToggle({ enabled, onChange }: ReminderToggleProps) {
  const id = 'reminder-toggle'

  return (
    <section className="es-reminder-toggle" aria-labelledby="reminder-toggle-title">
      <div className="es-reminder-toggle__icon" aria-hidden>
        <Bell size={20} />
      </div>
      <div className="es-reminder-toggle__text">
        <span className="es-reminder-toggle__title" id="reminder-toggle-title">
          Enable Reminders
        </span>
        <span className="es-reminder-toggle__sub">Get notified on scheduled days</span>
      </div>
      <label className="es-toggle" htmlFor={id} aria-label="Enable reminders">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={enabled}
          onChange={e => onChange(e.target.checked)}
          aria-checked={enabled}
          className="es-toggle__input"
        />
        <span className="es-toggle__track" aria-hidden>
          <span className="es-toggle__thumb" />
        </span>
      </label>
    </section>
  )
}
