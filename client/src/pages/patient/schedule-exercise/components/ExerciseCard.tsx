import { Dumbbell } from 'lucide-react'
import type { PlanExercise } from '../../MyPlan'

interface ExerciseCardProps {
  exercise: PlanExercise
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { from, to, iconColor } = exercise.thumb
  const isTreatment = exercise.plan === 'Treatment Plan'

  return (
    <article className="es-pool-card" aria-label={exercise.name}>
      <div
        className="es-pool-card__thumb"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        aria-hidden
      >
        <Dumbbell size={22} color={iconColor} strokeWidth={1.6} />
      </div>
      <div className="es-pool-card__body">
        <span className="es-pool-card__name">{exercise.name}</span>
        <span
          className={`es-pool-card__badge${isTreatment ? ' es-pool-card__badge--treatment' : ' es-pool-card__badge--training'}`}
        >
          {isTreatment ? 'Treatment' : 'Training'}
        </span>
        <span className="es-pool-card__desc">{exercise.desc}</span>
      </div>
    </article>
  )
}
