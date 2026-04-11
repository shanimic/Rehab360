import { cn } from '@/lib/utils'
import type { Patient, PainTrend } from '@/types'

interface PatientCardProps {
  patient: Patient
  featured?: boolean
  onClick: () => void
}

interface TrendConfig {
  label: string
  badge: string
  icon: React.ReactNode
}

const TREND_CONFIG: Record<PainTrend, TrendConfig> = {
  improving: {
    label: 'Improving',
    badge: 'bg-green-100 text-green-700',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
        <path d="M3 7l6 6 4-4 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 21l4-4-4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  stable: {
    label: 'Stable',
    badge: 'bg-amber-100 text-amber-700',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
        <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  worsening: {
    label: 'Worsening',
    badge: 'bg-red-100 text-red-700',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 3l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
}

const complianceColor = (v: number) => {
  if (v >= 80) return 'bg-green-500'
  if (v >= 55) return 'bg-amber-400'
  return 'bg-red-400'
}

export default function PatientCard({ patient, featured = false, onClick }: PatientCardProps) {
  const trend = TREND_CONFIG[patient.painTrend]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl p-5 transition-all active:scale-95 border',
        featured
          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md',
      )}
    >
      {/* Name + rehab type */}
      <div className="mb-4">
        <p className={cn('font-bold text-lg leading-snug', featured ? 'text-white' : 'text-slate-800')}>
          {patient.name}
        </p>
        <p className={cn('text-sm mt-0.5 truncate', featured ? 'text-blue-200' : 'text-slate-500')}>
          {patient.rehabType}
        </p>
      </div>

      {/* Compliance bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className={cn('text-sm font-medium', featured ? 'text-blue-200' : 'text-slate-500')}>
            Weekly compliance
          </span>
          <span className={cn('text-base font-bold', featured ? 'text-white' : 'text-slate-800')}>
            {patient.weeklyCompliance}%
          </span>
        </div>
        <div className={cn('w-full h-2 rounded-full', featured ? 'bg-blue-500' : 'bg-slate-100')}>
          <div
            className={cn('h-2 rounded-full transition-all', featured ? 'bg-white' : complianceColor(patient.weeklyCompliance))}
            style={{ width: `${patient.weeklyCompliance}%` }}
          />
        </div>
      </div>

      {/* Trend + last report */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full',
            featured ? 'bg-blue-500 text-white' : trend.badge,
          )}
        >
          {trend.icon}
          {trend.label}
        </span>
        <span className={cn('text-xs', featured ? 'text-blue-200' : 'text-slate-400')}>
          {patient.lastReport}
        </span>
      </div>
    </button>
  )
}
