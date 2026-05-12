import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VisitType, type DailyExerciseItem } from '@/types/patient'

export default function ExerciseItem({ exercise }: { exercise: DailyExerciseItem }) {
  const navigate = useNavigate()

  return (
    <button
      className="ph-exercise-item"
      onClick={() => navigate(`/patient/exercise/${exercise.exercise_id}`, { state: { exercise } })}
    >
      <div className="ph-exercise-item__check">
        {exercise.execution_status
          ? <CheckCircle2 size={24} className="ph-exercise-item__check--done" />
          : <div className="ph-exercise-item__check--placeholder" />}
      </div>
      <div className="ph-exercise-item__info">
        <div className="ph-exercise-item__name-row">
          <span className="ph-exercise-item__name">{exercise.exercise_name}</span>
          <span className={`ph-exercise-item__badge ph-exercise-item__badge--${exercise.visit_type === VisitType.PHYSIOTHERAPIST ? 'treatment' : 'training'}`}>
            {exercise.visit_type === VisitType.PHYSIOTHERAPIST ? 'Physio' : 'Fitness'}
          </span>
        </div>
        <span className="ph-exercise-item__desc">{exercise.reps} reps × {exercise.num_sets} sets</span>
        <span className="ph-exercise-item__desc">{exercise.text_instructions}</span>
      </div>
      <ChevronRight size={16} className="ph-exercise-item__arrow" />
    </button>
  )
}
