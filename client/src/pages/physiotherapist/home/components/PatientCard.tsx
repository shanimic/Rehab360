import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface PatientCardProps {
  patient: Patient
  featured?: boolean
  onClick: () => void
}

export default function PatientCard({ patient, featured = false, onClick }: PatientCardProps) {
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
      {/* Name + diagnosis */}
      <div className="mb-4">
        <p className={cn('font-bold text-lg leading-snug', featured ? 'text-white' : 'text-slate-800')}>
          {patient.name}
        </p>
        <p className={cn('text-sm mt-0.5 truncate', featured ? 'text-blue-200' : 'text-slate-500')}>
          {patient.medicalDiagnosis}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-end mb-1.5">
          <span className={cn('text-base font-bold', featured ? 'text-white' : 'text-slate-800')}>
            {patient.weeklyCompliance}%
          </span>
        </div>
        <div className={cn('w-full h-2 rounded-full', featured ? 'bg-blue-500' : 'bg-slate-100')}>
          <div
            className={cn('h-2 rounded-full transition-all', featured ? 'bg-white' : 'bg-blue-600')}
            style={{ width: `${patient.weeklyCompliance}%` }}
          />
        </div>
      </div>

      {/* Last updated */}
      <div className="flex justify-end">
        <span className={cn('text-xs', featured ? 'text-blue-200' : 'text-slate-400')}>
          {patient.lastReport}
        </span>
      </div>
    </button>
  )
}
