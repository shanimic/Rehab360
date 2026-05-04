import { Check } from 'lucide-react'

interface VerificationBadgeProps {
  verified_by_physio: boolean
  verified_by_trainer: boolean
}

export default function VerificationBadge({
  verified_by_physio,
  verified_by_trainer,
}: VerificationBadgeProps) {
  const both = verified_by_physio && verified_by_trainer

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {both && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 min-h-[28px]">
          <Check size={12} />Verified by Physio &amp; Trainer
        </span>
      )}
      {!both && verified_by_physio && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 min-h-[28px]">
          <Check size={12} />Verified by Physio
        </span>
      )}
      {!both && verified_by_trainer && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 min-h-[28px]">
          <Check size={12} />Verified by Trainer
        </span>
      )}
      {!verified_by_physio && !verified_by_trainer && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 min-h-[28px]">
          Not yet verified
        </span>
      )}
    </div>
  )
}
