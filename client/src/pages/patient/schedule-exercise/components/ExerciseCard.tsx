import { Dumbbell, Stethoscope } from 'lucide-react'
import type { WeeklyScheduleItem } from '@/types/patient'

interface ExerciseCardProps {
  exercise: WeeklyScheduleItem
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const isPhysio = exercise.visit_type?.toLowerCase() === 'physiotherapist'
  const description = `${exercise.num_sets} sets · ${exercise.reps} reps`

  const details: string[] = []
  if ((exercise.weight ?? 0) > 0) details.push(`${exercise.weight} kg`)
  if ((exercise.time_duration ?? 0) > 0)
    details.push(`${exercise.time_duration} ${exercise.time_unit?.toLowerCase()}`)

  return (
    <article className="es-pool-card" aria-label={exercise.exercise_name}>
      <div
        className="es-pool-card__thumb"
        style={{ background: isPhysio ? 'linear-gradient(135deg, #74b9ff, #0984e3)' : 'linear-gradient(135deg, #55efc4, #00b894)' }}
        aria-hidden
      >
        {isPhysio
          ? <Stethoscope size={22} color="#fff" strokeWidth={1.6} />
          : <Dumbbell size={22} color="#fff" strokeWidth={1.6} />
        }
      </div>
      <div className="es-pool-card__body">
        <span className="es-pool-card__name">{exercise.exercise_name}</span>
        <span
          className={`es-pool-card__badge${isPhysio ? ' es-pool-card__badge--treatment' : ' es-pool-card__badge--training'}`}
        >
          {isPhysio ? 'Physio' : 'Fitness'}
        </span>
        <span className="es-pool-card__desc">{description}</span>
        {details.length > 0 && (
          <span className="es-pool-card__detail">{details.join(' · ')}</span>
        )}
      </div>
    </article>
  )
}
