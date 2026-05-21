import { HeartPulse, Activity, Clock, Droplets, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueryChipsProps {
  // Called with the chip label when the user clicks a suggestion.
  // Parent pre-fills the FollowUpBar with this value — user can edit before submitting.
  onSelect: (chip: string) => void
}

// Suggested query topics shown on the idle screen.
// Each chip has a relevant lucide icon so the topic is scannable at a glance.
// To add or change suggestions, edit this array — no JSX changes needed.
const CHIPS = [
  { label: 'Post-surgery pain', Icon: HeartPulse },
  { label: 'Range of motion', Icon: Activity },
  { label: 'Recovery timelines', Icon: Clock },
  { label: 'Swelling after exercises', Icon: Droplets },
  { label: 'Understanding my diagnosis', Icon: Stethoscope },
]

export default function QueryChips({ onSelect }: QueryChipsProps) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {CHIPS.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className={cn(
            'flex items-center gap-1.5 text-sm py-2 px-3 rounded-full border border-gray-200 bg-white text-gray-600',
            'hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50',
            'transition-colors min-h-[44px]', // 44px min ensures touch-friendly tap target
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}
