import { Check } from 'lucide-react'

interface VerificationBadgeProps {
  physioVerificationCount: number
  trainerVerificationCount: number
}

export default function VerificationBadge({
  physioVerificationCount,
  trainerVerificationCount,
}: VerificationBadgeProps) {
  if (physioVerificationCount === 0 && trainerVerificationCount === 0) return null

  const parts: string[] = []
  if (physioVerificationCount > 0) parts.push(`${physioVerificationCount} Physio`)
  if (trainerVerificationCount > 0) parts.push(`${trainerVerificationCount} Trainer`)

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-teal-700 whitespace-nowrap">
      <Check size={12} />
      {parts.join(' · ')}
    </span>
  )
}
