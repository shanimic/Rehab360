import { CheckCircle2, Circle } from 'lucide-react'
import type { Exercise } from '../patient.types'

interface ExerciseItemProps {
  exercise: Exercise
}

export default function ExerciseItem({ exercise }: ExerciseItemProps) {
  return (
    <div className="ph-exercise-item">
      <div className="ph-exercise-item__check">
        {exercise.done
          ? <CheckCircle2 size={24} className="ph-exercise-item__check--done" />
          : <Circle size={24} className="ph-exercise-item__check--todo" />}
      </div>
      <div className="ph-exercise-item__info">
        <span className="ph-exercise-item__name">{exercise.name}</span>
        <span className={`ph-exercise-item__badge ph-exercise-item__badge--${exercise.plan === 'Treatment Plan' ? 'treatment' : 'training'}`}>
          {exercise.plan}
        </span>
        <span className="ph-exercise-item__desc">{exercise.desc}</span>
      </div>
    </div>
  )
}
