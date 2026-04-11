import { AlertTriangle, Info, XCircle } from 'lucide-react'
import type { AlertType } from '@/types/patient'
import './AlertCard.css'

interface AlertCardProps {
  type: AlertType
  message: string
}

const ICON_MAP: Record<AlertType, React.ReactNode> = {
  warning: <AlertTriangle size={18} />,
  critical: <XCircle size={18} />,
  info: <Info size={18} />,
}

export default function AlertCard({ type, message }: AlertCardProps) {
  return (
    <div className={`alert-card alert-card--${type}`}>
      <span className={`alert-card__icon alert-card__icon--${type}`}>
        {ICON_MAP[type]}
      </span>
      <p className="alert-card__message">{message}</p>
    </div>
  )
}
