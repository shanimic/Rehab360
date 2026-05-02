import { Dumbbell } from 'lucide-react'
import type { WeeklyScheduleItem } from '@/types/patient'

interface ExerciseCardProps {
  exercise: WeeklyScheduleItem
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const isPhysio = exercise.visit_type?.toLowerCase() === 'physiotherapist'
  const description = `${exercise.num_sets} sets · ${exercise.reps} reps`

  return (
    <article className="es-pool-card" aria-label={exercise.exercise_name}>
      <div
        className="es-pool-card__thumb"
        style={{ background: isPhysio ? 'linear-gradient(135deg, #74b9ff, #0984e3)' : 'linear-gradient(135deg, #55efc4, #00b894)' }}
        aria-hidden
      >
        <Dumbbell size={22} color="#fff" strokeWidth={1.6} />
      </div>
      <div className="es-pool-card__body">
        <span className="es-pool-card__name">{exercise.exercise_name}</span>
        <span
          className={`es-pool-card__badge${isPhysio ? ' es-pool-card__badge--treatment' : ' es-pool-card__badge--training'}`}
        >
          {isPhysio ? 'Physio' : 'Fitness'}
        </span>
        <span className="es-pool-card__desc">{description}</span>
      </div>
    </article>
  )
}
