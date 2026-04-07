import { FileText, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedContent, ApiRole } from '@/types'

interface SourceCardProps {
  source: SavedContent
  userRole: ApiRole
  onSave: (item: SavedContent) => void
  onVerify: (recommendationId: string, role: string) => void
  savedIds: Set<string>
}

function verificationBadge(verifiedBy: string[]) {
  const hasPhysio = verifiedBy.includes('THERAPIST')
  const hasCoach = verifiedBy.includes('TRAINER')
  if (hasPhysio && hasCoach)
    return { label: 'Verified by Physio & Coach', className: 'source-card__badge--both' }
  if (hasPhysio)
    return { label: 'Verified by Physio', className: 'source-card__badge--physio' }
  if (hasCoach)
    return { label: 'Verified by Coach', className: 'source-card__badge--coach' }
  return null
}

function roleVerifyKey(role: ApiRole): string | null {
  if (role === 'PHYSIOTHERAPIST') return 'THERAPIST'
  if (role === 'FITNESS_TRAINER') return 'TRAINER'
  return null
}

export default function SourceCard({ source, userRole, onSave, onVerify, savedIds }: SourceCardProps) {
  const badge = verificationBadge(source.verifiedBy)
  const isSaved = savedIds.has(source.recommendation_id)
  const verifyKey = roleVerifyKey(userRole)
  const hasVerified = verifyKey ? source.verifiedBy.includes(verifyKey) : false

  return (
    <div className="source-card">
      <div className="source-card__top">
        <div className="source-card__icon-wrap" aria-hidden="true">
          <FileText size={20} />
        </div>
        <div className="source-card__meta">
          <span className="source-card__type-badge">{source.content_type}</span>
          {badge && (
            <span className={cn('source-card__verify-badge', badge.className)}>
              <CheckCircle size={12} />
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <h3 className="source-card__title">{source.content_title}</h3>
      <p className="source-card__desc">{source.content_text}</p>

      <div className="source-card__actions">
        <button className="source-card__btn source-card__btn--primary">Read More</button>
        <button
          className={cn(
            'source-card__btn source-card__btn--outline',
            isSaved && 'source-card__btn--saved',
          )}
          disabled={isSaved}
          onClick={() => !isSaved && onSave(source)}
        >
          {isSaved ? 'Saved ✓' : 'Save'}
        </button>
        {verifyKey && (
          <button
            className={cn(
              'source-card__btn source-card__btn--outline',
              hasVerified && 'source-card__btn--verified',
            )}
            onClick={() => onVerify(source.recommendation_id, verifyKey)}
          >
            {hasVerified ? 'Verified ✓' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  )
}
