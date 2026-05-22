import type { ComponentType } from 'react'
import {
  FileText,
  ClipboardList,
  Activity,
  Video,
  ShieldCheck,
  BookmarkX,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import VerificationBadge from '@/pages/ai-search/components/VerificationBadge'
import type { ContentType, ApiRole } from '@/types'

interface SourceCardProps {
  title: string
  url: string
  description: string | null
  contentType: ContentType
  physioVerificationCount: number
  trainerVerificationCount: number
  userRole: ApiRole
  isSaved?: boolean
  isVerifiedByMe?: boolean
  onSave?: () => void
  onVerify?: () => void
  onRemove?: () => void
}

const CONTENT_TYPE_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Article: FileText,
  'Clinical Guideline': ClipboardList,
  'Exercise Guide': Activity,
  Video: Video,
}

export default function SourceCard({
  title,
  url,
  description,
  contentType,
  physioVerificationCount,
  trainerVerificationCount,
  userRole,
  isSaved = false,
  isVerifiedByMe = false,
  onSave,
  onVerify,
  onRemove,
}: SourceCardProps) {
  const isVerified = physioVerificationCount > 0 || trainerVerificationCount > 0
  const canVerify = userRole === 'PHYSIOTHERAPIST' || userRole === 'FITNESS_TRAINER'
  const isSavedVariant = onRemove !== undefined
  const ContentIcon = CONTENT_TYPE_ICON[contentType] ?? FileText

  return (
    <article
      className={cn(
        'group relative rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow',
        isVerified
          ? 'border-l-[2.5px] border-l-teal-500'
          : 'border border-gray-100',
      )}
    >
      {/* Full-card stretch link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open: ${title}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-blue-500"
      />

      {/* Header + description — pointer-events-none lets clicks reach the anchor */}
      <div className="relative pointer-events-none p-4 pb-2">
        <header className="flex items-start gap-x-1.5 gap-y-1 flex-wrap">
          <ContentIcon size={16} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{contentType}</span>
          <span className="text-xs text-gray-300 flex-shrink-0 mt-0.5">·</span>
          <span className="text-sm font-semibold text-gray-800 leading-snug flex-1 min-w-[120px]">
            {title}
          </span>
          {isVerified && (
            <div className="ml-auto flex-shrink-0">
              <VerificationBadge
                physioVerificationCount={physioVerificationCount}
                trainerVerificationCount={trainerVerificationCount}
              />
            </div>
          )}
        </header>
        <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-3 leading-relaxed mt-1">
          {description}
        </p>
      </div>

      {/* Action bar — always visible on mobile, hover-revealed on desktop */}
      <div className="relative z-10 pointer-events-auto flex items-center gap-2 px-4 pb-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
        {isSavedVariant ? (
          <button
            onClick={onRemove}
            aria-label="Remove from saved"
            className="ml-auto p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <BookmarkX size={16} />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                aria-label={isSaved ? 'Saved' : 'Save'}
                className={cn(
                  'p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
                  isSaved
                    ? 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600',
                )}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}
            {canVerify && onVerify && (
              <button
                onClick={onVerify}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-full border transition-colors min-h-[44px]',
                  isVerifiedByMe
                    ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600',
                )}
              >
                <ShieldCheck size={16} />
                {isVerifiedByMe ? 'Verified ✓' : 'Verify'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
