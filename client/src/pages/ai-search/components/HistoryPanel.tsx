import { useNavigate } from 'react-router-dom'
import { Clock, X, Bookmark, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiQuery } from '@/types'

interface HistoryPanelProps {
  history: AiQuery[]
  onSelect: (queryText: string) => void
  onDelete: (queryId: string) => void
  onClearAll: () => void
  savedCount: number
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function HistoryPanel({
  history,
  onSelect,
  onDelete,
  onClearAll,
  savedCount,
}: HistoryPanelProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Recent Searches</h2>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors min-h-[44px] px-2"
          >
            Clear all
          </button>
        )}
      </div>

      <button
        onClick={() => navigate('/ai-search/saved')}
        className={cn(
          'w-full flex items-center gap-2 px-3 rounded-xl min-h-[44px]',
          'border border-gray-200 text-sm text-gray-600',
          'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all',
        )}
      >
        <Bookmark size={14} className="flex-shrink-0" />
        <span className="flex-1 text-left font-medium">My Saved Content</span>
        {savedCount > 0 && (
          <span className="text-xs text-gray-400">({savedCount})</span>
        )}
        <ChevronRight size={14} className="flex-shrink-0 text-gray-400" />
      </button>

      {history.length === 0 && (
        <p className="text-sm text-gray-400 italic">No recent searches yet.</p>
      )}

      <ul className="flex flex-col gap-1">
        {history.map((q) => (
          <li
            key={q.query_id}
            className={cn(
              'group relative flex items-start gap-2 p-3 rounded-xl cursor-pointer',
              'border border-transparent hover:border-blue-200 hover:bg-blue-50',
              'transition-all min-h-[44px]',
            )}
          >
            <button
              className="flex-1 text-left flex items-start gap-2 min-w-0"
              onClick={() => onSelect(q.query_text)}
            >
              <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm text-gray-700 truncate">{q.query_text}</p>
                <span className="text-xs text-gray-400">{relativeDate(q.query_date)}</span>
              </div>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(q.query_id) }}
              aria-label="Remove search"
              className={cn(
                'flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors',
                'min-h-[44px] min-w-[44px] flex items-center justify-center',
                'lg:opacity-0 lg:group-hover:opacity-100',
              )}
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>

    </div>
  )
}
