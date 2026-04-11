import type { Appointment } from '@/types'

interface ScheduleCardProps {
  schedule: Appointment[]
}

export default function ScheduleCard({ schedule }: ScheduleCardProps) {
  return (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Header — aligned with Alerts header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">Today's Schedule</h2>
        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {schedule.length}
        </span>
      </div>

      {/* Scrollable list */}
      <ul style={{ flex: 1, overflowY: 'auto' }}>
        {schedule.map((appt, index) => (
          <li
            key={appt.id}
            className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-0 active:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="shrink-0 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-[11px] font-semibold tabular-nums">
              {appt.time}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 text-sm truncate">{appt.patientName}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{appt.reason}</p>
            </div>
            {index === 0 && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-green-400" />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
