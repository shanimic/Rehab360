import { useState } from 'react'
import { cn } from '@/lib/utils'
import VerificationBadge from './VerificationBadge'
import type { SavedContent, ApiRole } from '@/types'

interface SourceCardProps {
  source: SavedContent
  userRole: ApiRole
  mode: 'results' | 'saved'
  onSave?: (item: SavedContent) => void
  onUnsave?: (recommendationId: string) => void
  onVerify?: (recommendationId: string, role: 'PHYSIOTHERAPIST' | 'FITNESS_TRAINER') => void
  savedIds?: Set<string>
}

const CONTENT_TYPE_EMOJI: Record<string, string> = {
  Article: '📄',
  'Clinical Guideline': '📋',
  'Exercise Guide': '🏋️',
}

export default function SourceCard({
  source,
  userRole,
  mode,
  onSave,
  onUnsave,
  onVerify,
  savedIds,
}: SourceCardProps) {
  const [localSaved, setLocalSaved] = useState(false)
  const isSaved = localSaved || (savedIds?.has(source.recommendation_id) ?? false)
  const isVerified = source.verified_by_physio || source.verified_by_trainer
  const canVerify = userRole === 'PHYSIOTHERAPIST' || userRole === 'FITNESS_TRAINER'
  const emoji = CONTENT_TYPE_EMOJI[source.content_type] ?? '📄'

  function handleSave() {
    if (isSaved || !onSave) return
    setLocalSaved(true)
    onSave(source)
  }

  function handleVerify() {
    if (!onVerify) return
    const role = userRole === 'PHYSIOTHERAPIST' ? 'PHYSIOTHERAPIST' : 'FITNESS_TRAINER'
    onVerify(source.recommendation_id, role)
  }

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow',
        isVerified && 'border-l-4 border-l-green-500',
        !isVerified && 'border border-gray-100',
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-xl flex-shrink-0" aria-hidden="true">{emoji}</span>
          <div className="flex flex-wrap gap-1.5 items-center min-w-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {source.content_type}
            </span>
            <VerificationBadge
              verified_by_physio={source.verified_by_physio}
              verified_by_trainer={source.verified_by_trainer}
              is_injected={source.is_injected}
            />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{source.content_title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-3 leading-relaxed">
          {source.content_text}
        </p>
      </div>

      {mode === 'results' && (
        <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:gap-2">
          <a
            href={source.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'col-span-2 lg:col-span-1 text-center text-sm font-medium px-4 py-2.5 rounded-xl',
              'bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]',
              'flex items-center justify-center',
            )}
          >
            Read More →
          </a>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              'text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors min-h-[44px]',
              isSaved
                ? 'bg-green-50 text-green-600 border-green-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
            )}
          >
            {isSaved ? 'Saved ✓' : 'Save'}
          </button>
          {canVerify && (
            <button
              onClick={handleVerify}
              className={cn(
                'text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors min-h-[44px]',
                'bg-white text-purple-600 border-purple-200 hover:bg-purple-50',
              )}
            >
              Verify ✦
            </button>
          )}
        </div>
      )}

      {mode === 'saved' && (
        <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:gap-2">
          <a
            href={source.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'col-span-2 lg:col-span-1 text-center text-sm font-medium px-4 py-2.5 rounded-xl',
              'bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]',
              'flex items-center justify-center',
            )}
          >
            Read More →
          </a>
          <button
            onClick={() => onUnsave?.(source.recommendation_id)}
            className={cn(
              'text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors min-h-[44px]',
              'bg-white text-red-500 border-red-200 hover:bg-red-50',
              'lg:opacity-0 lg:group-hover:opacity-100',
            )}
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  )
}
