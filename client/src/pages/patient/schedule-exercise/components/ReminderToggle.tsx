interface ReminderToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function GoogleCalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M22,4.5v6H10v11H4V6.5a2.0059,2.0059,0,0,1,2-2Z" fill="#4285f4"/>
      <polygon fill="#ea4435" points="22 27.5 22 21.5 28 21.5 22 27.5"/>
      <rect fill="#ffba00" height="12" width="6" x="22" y="9.5"/>
      <rect fill="#00ac47" height="12" transform="translate(40.5 8.5) rotate(90)" width="6" x="13" y="18.5"/>
      <path d="M28,6.5v4H22v-6h4A2.0059,2.0059,0,0,1,28,6.5Z" fill="#0066da"/>
      <path d="M10,21.5v6H6a2.0059,2.0059,0,0,1-2-2v-4Z" fill="#188038"/>
      <path d="M15.69,17.09c0,.89-.66,1.79-2.15,1.79a3.0026,3.0026,0,0,1-1.52-.39l-.08-.06.29-.82.13.08a2.3554,2.3554,0,0,0,1.17.34,1.191,1.191,0,0,0,.88-.31.8586.8586,0,0,0,.25-.65c-.01-.73-.68-.99-1.31-.99h-.54v-.81h.54c.45,0,1.12-.22,1.12-.82,0-.45-.31-.71-.85-.71a1.8865,1.8865,0,0,0-1.04.34l-.14.1-.28-.79.07-.06a2.834,2.834,0,0,1,1.53-.45c1.19,0,1.72.73,1.72,1.45a1.4369,1.4369,0,0,1-.81,1.3A1.52,1.52,0,0,1,15.69,17.09Z" fill="#4285f4"/>
      <polygon fill="#4285f4" points="18.71 12.98 18.71 18.79 17.73 18.79 17.73 14 16.79 14.51 16.58 13.69 17.95 12.98 18.71 12.98"/>
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
