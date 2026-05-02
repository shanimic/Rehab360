import { Check, Hospital } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  verified_by_physio: boolean
  verified_by_trainer: boolean
  is_injected: boolean
}

export default function VerificationBadge({
  verified_by_physio,
  verified_by_trainer,
  is_injected,
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
      {is_injected && (
        <span className={cn('inline-flex items-center gap-1 text-xs italic px-2 py-1 rounded-full bg-blue-50 text-blue-600 min-h-[28px]')}>
          <Hospital size={12} />From your clinic
        </span>
      )}
    </div>
  )
}
