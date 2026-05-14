import { Check } from 'lucide-react'

interface VerificationBadgeProps {
  physio_verification_count: number
  trainer_verification_count: number
}

export default function VerificationBadge({
  physio_verification_count,
  trainer_verification_count,
}: VerificationBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {physio_verification_count > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 min-h-[28px]">
          <Check size={12} />{physio_verification_count} Physio
        </span>
      )}
      {trainer_verification_count > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 min-h-[28px]">
          <Check size={12} />{trainer_verification_count} Trainer
        </span>
      )}
    </div>
  )
}
