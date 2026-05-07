import { X, Calendar } from 'lucide-react'
import { buildCalendarUrl } from '../utils/buildCalendarUrl'

export interface CalendarItem {
  exerciseName: string
  date: string
  time: string
}

interface Props {
  items: CalendarItem[]
  onSave: () => void
  onClose: () => void
}

export default function CalendarLinksModal({ items, onSave, onClose }: Props) {
  return (
    <div
      className="es-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="es-modal">
        <header className="es-modal__header">
          <h3 className="es-modal__title" id="cal-modal-title">Add to Google Calendar</h3>
          <button className="es-modal__close" onClick={onClose} aria-label="Close" type="button">
            <X size={18} />
          </button>
        </header>

        <ul className="es-modal__list es-cal-list" aria-label="Exercise reminders">
          {items.map((item, i) => (
            <li key={i} className="es-cal-item">
              <div className="es-cal-item__info">
                <span className="es-cal-item__name">{item.exerciseName}</span>
                <span className="es-cal-item__time">
                  {item.date} · {item.time}
                </span>
              </div>
              <a
                href={buildCalendarUrl(item.exerciseName, item.date, item.time)}
                target="_blank"
                rel="noopener noreferrer"
                className="es-cal-item__btn"
                aria-label={`Add ${item.exerciseName} to Google Calendar`}
              >
                <Calendar size={14} />
                Add To Google Calendar
              </a>
            </li>
          ))}
        </ul>

        <footer className="es-modal__footer">
          <button className="es-modal__cancel" onClick={onClose} type="button">
            Skip
          </button>
          <button className="es-modal__confirm" onClick={onSave} type="button">
            Save Schedule
          </button>
        </footer>
      </div>
    </div>
  )
}
