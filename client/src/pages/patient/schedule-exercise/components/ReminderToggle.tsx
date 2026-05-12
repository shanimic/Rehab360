interface ReminderToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function GoogleCalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1.2" />
      <rect x="3" y="4" width="18" height="5" rx="2" fill="#1a73e8" />
      <rect x="3" y="7" width="18" height="2" fill="#1a73e8" />
      <line x1="8" y1="4" x2="8" y2="7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="4" x2="16" y2="7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <text x="12" y="18.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1a73e8" fontFamily="sans-serif">G</text>
    </svg>
  )
}

export default function ReminderToggle({ enabled, onChange }: ReminderToggleProps) {
  const id = 'reminder-toggle'

  return (
    <section className="es-reminder-toggle" aria-labelledby="reminder-toggle-title">
      <div className="es-reminder-toggle__icon" aria-hidden>
        <GoogleCalendarIcon />
      </div>
      <div className="es-reminder-toggle__text">
        <span className="es-reminder-toggle__title" id="reminder-toggle-title">
          Set Google Calendar Reminder
        </span>
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
