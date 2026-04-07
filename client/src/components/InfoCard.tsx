import type { ReactNode } from 'react'
import './InfoCard.css'

interface InfoCardProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}

export default function InfoCard({ title, actionLabel, onAction, children }: InfoCardProps) {
  return (
    <div className="info-card">
      <div className="info-card__header">
        <h3 className="info-card__title">{title}</h3>
        {actionLabel && (
          <button type="button" className="info-card__action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
