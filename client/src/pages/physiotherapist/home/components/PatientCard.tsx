import { cn } from '@/lib/utils'
import type { HomePatientCard } from '@/types'

interface PatientCardProps {
  patient: HomePatientCard
  featured?: boolean
  onClick: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No reports yet'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PatientCard({ patient, featured = false, onClick }: PatientCardProps) {
  const name = `${patient.first_name} ${patient.last_name}`.trim()
  const progress = patient.progress_percentage ?? 0

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
          {name}
        </p>
        <p className={cn('text-sm mt-0.5 truncate', featured ? 'text-blue-200' : 'text-slate-500')}>
          {patient.medical_diagnosis}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-end mb-1.5">
          <span className={cn('text-base font-bold', featured ? 'text-white' : 'text-slate-800')}>
            {progress}%
          </span>
        </div>
        <div className={cn('w-full h-2 rounded-full', featured ? 'bg-blue-500' : 'bg-slate-100')}>
          <div
            className={cn('h-2 rounded-full transition-all', featured ? 'bg-white' : 'bg-blue-600')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Last updated */}
      <div className="flex justify-end">
        <span className={cn('text-xs', featured ? 'text-blue-200' : 'text-slate-400')}>
          {formatDate(patient.last_progress_update)}
        </span>
      </div>
    </button>
  )
}
