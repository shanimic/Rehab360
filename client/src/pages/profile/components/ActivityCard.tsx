import type React from 'react'

import { useMyPlans } from '@/hooks/useMyPlans'

function PatientPlans() {
  const { data: plans } = useMyPlans()

  if (!plans || plans.length === 0) {
    return <p className="pp-activity__empty">No active plans yet</p>
  }

  return (
    <div className="pp-activity__plans">
      {plans.map((plan) => (
        <div key={plan.plan_id} className="pp-activity__plan-row">
          <span className="pp-activity__plan-category text-xs tracking-wide">{plan.category}</span>
          <span className="pp-activity__plan-goal text-sm font-medium">{plan.goal}</span>
          <div className="pp-activity__plan-bar-row">
            <div className="pp-activity__bar-track">
              <div
                className="pp-activity__bar-fill"
                style={{ '--fill': `${plan.completion_percent}%` } as React.CSSProperties}
              />
            </div>
            <span className="pp-activity__plan-percent">{plan.completion_percent}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ActivityCard() {
  return (
    <div className="pp-card">
      <h2 className="pp-card__title">Active Plans</h2>
      <PatientPlans />
    </div>
  )
}
