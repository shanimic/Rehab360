import { Check } from 'lucide-react'

interface VerificationBadgeProps {
  physio_verification_count: number
  trainer_verification_count: number
}

export default function VerificationBadge({
  physio_verification_count,
  trainer_verification_count,
}: VerificationBadgeProps) {
  if (physio_verification_count === 0 && trainer_verification_count === 0) return null

  const parts: string[] = []
  if (physio_verification_count > 0) parts.push(`${physio_verification_count} Physio`)
  if (trainer_verification_count > 0) parts.push(`${trainer_verification_count} Trainer`)

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-teal-700 whitespace-nowrap">
      <Check size={12} />
      {parts.join(' · ')}
    </span>
  )
}
