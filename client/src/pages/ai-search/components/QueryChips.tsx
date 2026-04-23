import { cn } from '@/lib/utils'

interface QueryChipsProps {
  onSelect: (chip: string) => void
}

const CHIPS = [
  'Post-surgery pain',
  'Range of motion',
  'Understanding my diagnosis',
  'Recovery timelines',
  'Swelling after exercises',
  'Soreness vs joint pain',
]

export default function QueryChips({ onSelect }: QueryChipsProps) {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500 mb-2">Quick start</p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onSelect(chip)}
            className={cn(
              'text-sm py-2 px-3 rounded-full border border-gray-200 bg-white text-gray-600',
              'hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50',
              'transition-colors min-h-[44px]',
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
