import { useState } from 'react'
import type { ComponentType } from 'react'
import { FileText, ClipboardList, Activity, Video, Check, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import VerificationBadge from './VerificationBadge'
import type { SavePayload } from '@/hooks/useSaveContent'
import type { SourceCard as SourceCardType, SavedContent, ApiRole } from '@/types'

interface SourceCardProps {
  source: SourceCardType | SavedContent
  userRole: ApiRole
  mode: 'results' | 'saved'
  query_id?: number
  onSave?: (payload: SavePayload) => void
  onUnsave?: (savingId: number) => void
  onVerify?: (url: string, verified: boolean) => void
  savedIds?: Set<string>
}

const CONTENT_TYPE_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Article: FileText,
  'Clinical Guideline': ClipboardList,
  'Exercise Guide': Activity,
  Video: Video,
}

function isSavedContent(source: SourceCardType | SavedContent): source is SavedContent {
  return 'saving_id' in source
}

export default function SourceCard({
  source,
  userRole,
  mode,
  query_id,
  onSave,
  onUnsave,
  onVerify,
  savedIds,
}: SourceCardProps) {
  const [localSaved, setLocalSaved] = useState(false)

  const saved = isSavedContent(source)
  const title = saved ? source.content_title : source.title
  const url = saved ? source.source_url : source.url
  const description = saved ? source.content_text : source.description

  const serverVerifiedByPhysio = saved ? source.verified_by_physio : source.verified_by_physio
  const serverVerifiedByTrainer = saved ? source.verified_by_trainer : source.verified_by_trainer

  const [localVerifiedByPhysio, setLocalVerifiedByPhysio] = useState(serverVerifiedByPhysio)
  const [localVerifiedByTrainer, setLocalVerifiedByTrainer] = useState(serverVerifiedByTrainer)

  const verifiedByPhysio = localVerifiedByPhysio
  const verifiedByTrainer = localVerifiedByTrainer
  const isVerified = verifiedByPhysio || verifiedByTrainer

  const isSaved = localSaved || (savedIds?.has(url) ?? false)
  const canVerify = userRole === 'PHYSIOTHERAPIST' || userRole === 'FITNESS_TRAINER'
  const isPhysio = userRole === 'PHYSIOTHERAPIST'
  const myVerified = isPhysio ? verifiedByPhysio : verifiedByTrainer
  const ContentIcon = CONTENT_TYPE_ICON[source.content_type] ?? FileText

  function handleSave() {
    if (isSaved || !onSave || saved || query_id === undefined) return
    setLocalSaved(true)
    onSave({
      title,
      url,
      content_text: description ?? null,
      content_type: source.content_type,
      query_id,
    })
  }

  function handleVerify() {
    if (!onVerify) return
    const next = !myVerified
    if (isPhysio) setLocalVerifiedByPhysio(next)
    else setLocalVerifiedByTrainer(next)
    onVerify(url, next)
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
          <ContentIcon size={20} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5 items-center min-w-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {source.content_type}
            </span>
            <VerificationBadge
              verified_by_physio={verifiedByPhysio}
              verified_by_trainer={verifiedByTrainer}
            />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 lg:line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>

      {mode === 'results' && (
        <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'col-span-2 lg:col-span-1 text-center text-sm font-medium px-4 py-2.5 rounded-xl',
              'bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]',
              'flex items-center justify-center',
            )}
          >
            Read More
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
            {isSaved ? <span className="inline-flex items-center gap-1"><Check size={16} />Saved</span> : 'Save'}
          </button>
          {canVerify && (
            <button
              onClick={handleVerify}
              className={cn(
                'text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors min-h-[44px]',
                myVerified
                  ? 'bg-green-50 text-green-700 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50',
              )}
            >
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={16} />
                {myVerified ? 'Verified ✓' : 'Verify'}
              </span>
            </button>
          )}
        </div>
      )}

      {mode === 'saved' && (
        <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'col-span-2 lg:col-span-1 text-center text-sm font-medium px-4 py-2.5 rounded-xl',
              'bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]',
              'flex items-center justify-center',
            )}
          >
            Read More
          </a>
          <button
            onClick={() => saved && onUnsave?.(source.saving_id)}
            className={cn(
              'text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors min-h-[44px]',
              'bg-white text-red-500 border-red-200 hover:bg-red-50',
              'lg:opacity-0 lg:group-hover:opacity-100',
            )}
          >
            <span className="inline-flex items-center gap-1"><X size={16} />Remove</span>
          </button>
        </div>
      )}
    </div>
  )
}
