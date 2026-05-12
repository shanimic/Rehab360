import { ChevronRight, CheckCircle2 } from 'lucide-react'
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
      {completed && (
        <CheckCircle2 size={22} color="#22c55e" strokeWidth={2} className="mp-card__done-icon" />
      )}
      <div className="mp-card__info">
        <div className="mp-card__top-row">
          <span className="mp-card__name">{exercise.exercise_name}</span>
          <span className={`mp-card__badge mp-card__badge--${isPhysio ? 'physio' : 'fitness'}`}>
            {isPhysio ? 'Physio' : 'Fitness'}
          </span>
        </div>
        <span className="mp-card__sets">{exercise.reps} reps × {exercise.num_sets} sets</span>
        <span className="mp-card__desc">{exercise.text_instructions}</span>
      </div>
      {!completed && <ChevronRight size={18} className="mp-card__arrow" />}
    </button>
  )
}
