import { useMyPlans } from '@/hooks/useMyPlans'
import { useMyStats } from '@/hooks/useMyStats'
import type { ApiRole } from '@/types'

interface ActivityCardProps {
  role: ApiRole
}

function PatientPlans() {
  const { data: plans } = useMyPlans()

  if (!plans || plans.length === 0) {
    return <p className="pp-activity__empty">No active plans yet</p>
  }

  return (
    <div className="pp-activity__plans">
      {plans.map((plan) => (
        <div key={plan.plan_id} className="pp-activity__plan-row">
          <span className="pp-activity__plan-goal">{plan.goal}</span>
          <div className="pp-activity__progress-wrap">
            <div className="pp-activity__progress-track">
              <div className="pp-activity__progress-fill" />
            </div>
            <span className="pp-activity__progress-label">60%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfessionalStats({ role }: { role: ApiRole }) {
  const { data: stats } = useMyStats()
  const plansLabel = role === 'PHYSIOTHERAPIST' ? 'Active Treatment Plans' : 'Active Training Plans'

  return (
    <div className="pp-activity__stats">
      <div className="pp-activity__stat-block">
        <span className="pp-activity__stat-value">{stats?.total_visits ?? 0}</span>
        <span className="pp-activity__stat-label">Total Documented Visits</span>
      </div>
      <div className="pp-activity__stat-block">
        <span className="pp-activity__stat-value">{stats?.active_plans ?? 0}</span>
        <span className="pp-activity__stat-label">{plansLabel}</span>
      </div>
    </div>
  )
}

export default function ActivityCard({ role }: ActivityCardProps) {
  const isPatient = role === 'PATIENT'

  return (
    <div className="pp-card">
      <h2 className="pp-card__title">{isPatient ? 'Active Plans' : 'My Activity Stats'}</h2>
      {isPatient ? <PatientPlans /> : <ProfessionalStats role={role} />}
    </div>
  )
}
