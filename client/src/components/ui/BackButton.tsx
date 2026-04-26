import { ChevronLeft } from 'lucide-react'
import './BackButton.css'

interface BackButtonProps {
  onClick: () => void
  'aria-label'?: string
}

export default function BackButton({ onClick, 'aria-label': ariaLabel = 'Go back' }: BackButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className="back-btn">
      <ChevronLeft size={20} />
    </button>
  )
}
