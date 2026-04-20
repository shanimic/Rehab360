import { useState } from 'react'
import { ChevronRight, Video, MapPin } from 'lucide-react'
import type { Session } from '../patient.types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function buildWeek(): Date[] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function buildSessions(): Session[] {
  const today = new Date()
  const d = (offset: number) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    return date
  }
  return [
    { id: 1, title: 'Physiotherapy', professional: 'Dr. Sarah Cohen', date: d(1), time: '10:00 AM', type: 'clinic', color: '#1a56db' },
    { id: 2, title: 'Fitness Training', professional: 'Mike Torres', date: d(3), time: '2:30 PM', type: 'online', color: '#10b981' },
    { id: 3, title: 'Progress Review', professional: 'Dr. Sarah Cohen', date: d(7), time: '11:00 AM', type: 'clinic', color: '#1a56db' },
  ]
}

function fmtSession(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

const sessions = buildSessions()

export default function CalendarCard() {
  const week = buildWeek()
  const today = new Date()
  const [selected, setSelected] = useState(today.getDay())

  return (
    <div className="ph-calendar-card">
      <div className="ph-section__header">
        <h2 className="ph-section__title">Upcoming Sessions</h2>
        <button className="ph-section__view-all">View All</button>
      </div>

      <div className="ph-week-strip">
        {week.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          const hasEvent = sessions.some(s => s.date.toDateString() === day.toDateString())
          return (
            <button
              key={i}
              className={`ph-week-day${selected === i ? ' ph-week-day--selected' : ''}${isToday ? ' ph-week-day--today' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="ph-week-day__label">{DAYS[day.getDay()]}</span>
              <span className="ph-week-day__num">{day.getDate()}</span>
              {hasEvent && <span className="ph-week-day__dot" />}
            </button>
          )
        })}
      </div>

      <div className="ph-session-list">
        {sessions.map(s => (
          <div
            className="ph-session-item"
            key={s.id}
            style={{ '--ph-session-color': s.color } as React.CSSProperties}
          >
            <div className="ph-session-item__left">
              <span className="ph-session-item__title">{s.title}</span>
              <span className="ph-session-item__pro">{s.professional}</span>
              <span className="ph-session-item__meta">
                {fmtSession(s.date)} · {s.time}
              </span>
            </div>
            <div className="ph-session-item__right">
              <span className={`ph-session-item__type ph-session-item__type--${s.type}`}>
                {s.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
                {s.type === 'online' ? 'Online' : 'Clinic'}
              </span>
              <ChevronRight size={16} className="ph-session-item__arrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
