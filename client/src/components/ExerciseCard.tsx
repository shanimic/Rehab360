import { ChevronRight, CheckCircle2, Dumbbell } from 'lucide-react'
import type { MyPlan } from '@/types/patient'

interface ExerciseCardProps {
  exercise: MyPlan
  onClick?: () => void
  completed?: boolean
}

export default function ExerciseCard({ exercise, onClick, completed = false }: ExerciseCardProps) {
  const isPhysio = exercise.visit_type?.toLowerCase() === 'physiotherapist'

  return (
    <button
      className={`mp-card${completed ? ' mp-card--completed' : ''}`}
      onClick={completed ? undefined : onClick}
      disabled={completed}
      type="button"
    >
      <div
        className="mp-card__thumb"
        style={!completed ? { background: 'linear-gradient(135deg, #74b9ff, #0984e3)' } : undefined}
        aria-hidden
      >
        {completed
          ? <CheckCircle2 size={26} color="#22c55e" strokeWidth={2} />
          : <Dumbbell size={26} color="#fff" strokeWidth={1.6} />}
      </div>
      <div className="mp-card__info">
        <div className="mp-card__top-row">
          <span className="mp-card__name">{exercise.exercise_name}</span>
          <span className={`mp-card__badge mp-card__badge--${isPhysio ? 'physio' : 'fitness'}`}>
            {isPhysio ? 'Physio' : 'Fitness'}
          </span>
        </div>
        <span className="mp-card__desc">{exercise.text_instructions}</span>
      </div>
      {!completed && <ChevronRight size={18} className="mp-card__arrow" />}
    </button>
  )
}
