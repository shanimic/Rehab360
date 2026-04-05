import './StepIndicator.css'

interface StepIndicatorProps {
  currentStep: 1 | 2
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      <div className="step-indicator__step">
        <div className="step-indicator__circle step-indicator__circle--active">1</div>
        <span className="step-indicator__label step-indicator__label--active">Select Role</span>
      </div>

      <div className={`step-indicator__connector${currentStep === 2 ? ' step-indicator__connector--active' : ''}`} />

      <div className="step-indicator__step">
        <div className={`step-indicator__circle${currentStep === 2 ? ' step-indicator__circle--active' : ''}`}>2</div>
        <span className={`step-indicator__label${currentStep === 2 ? ' step-indicator__label--active' : ''}`}>
          Enter Details
        </span>
      </div>
    </div>
  )
}
