import { cn } from '@/lib/utils'
import type { PatientAlert, AlertType } from '@/types'

interface AlertItemProps {
  alert: PatientAlert
}

interface AlertStyle {
  label: string
  wrapper: string
  badge: string
}

const ALERT_STYLES: Record<AlertType, AlertStyle> = {
  overexertion: {
    label: 'Critical',
    wrapper: 'bg-red-50',
    badge: 'bg-red-500 text-white',
  },
  pain_spike: {
    label: 'Pain Spike',
    wrapper: 'bg-orange-50',
    badge: 'bg-orange-500 text-white',
  },
  inactivity: {
    label: 'Inactive',
    wrapper: 'bg-amber-50',
    badge: 'bg-amber-500 text-white',
  },
  stuck: {
    label: 'Stuck',
    wrapper: 'bg-blue-50',
    badge: 'bg-blue-500 text-white',
  },
  milestone: {
    label: 'Milestone',
    wrapper: 'bg-green-50',
    badge: 'bg-green-500 text-white',
  },
}

export default function AlertItem({ alert }: AlertItemProps) {
  const s = ALERT_STYLES[alert.type]

  return (
    <div className={cn('rounded-xl px-4 py-3 transition-all active:scale-[0.99]', s.wrapper)}>
      <div className="flex items-center gap-2.5 mb-1">
        <span className={cn('inline-block text-xs font-bold px-3 py-1 rounded-full tracking-wide', s.badge)}>
          {s.label}
        </span>
        <p className="font-bold text-slate-800 text-sm leading-none">{alert.patientName}</p>
      </div>
      <p className="text-xs text-slate-500 leading-snug">{alert.message}</p>
    </div>
  )
}
