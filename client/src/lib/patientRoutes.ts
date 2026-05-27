export function patientDetailPath(role: string, patientId: string): string {
  if (role === 'PATIENT') return '/patient/my-process'
  if (role === 'PHYSIOTHERAPIST') return `/physiotherapist/patient/${patientId}`
  return `/fitness/patient/${patientId}`
}

export function visitSummariesPath(role: string, patientId: string): string {
  if (role === 'PATIENT') return '/patient/visit-summaries'
  if (role === 'PHYSIOTHERAPIST') return `/physiotherapist/patient/${patientId}/visit-summaries`
  return `/fitness/patient/${patientId}/visit-summaries`
}

export function newVisitSummaryPath(role: string, patientId: string): string {
  if (role === 'PHYSIOTHERAPIST') return `/physiotherapist/patient/${patientId}/visit-summaries/new`
  return `/fitness/patient/${patientId}/visit-summaries/new`
}

export function visitSummaryDetailPath(role: string, patientId: string, visitId: string | number): string {
  if (role === 'PATIENT') return `/patient/visit-summaries/${visitId}`
  if (role === 'PHYSIOTHERAPIST') return `/physiotherapist/patient/${patientId}/visit-summaries/${visitId}`
  return `/fitness/patient/${patientId}/visit-summaries/${visitId}`
}

// visitType is required for PATIENT to distinguish treatment vs fitness plan.
export function planPath(role: string, patientId: string, planId: number, visitType?: string): string {
  if (role === 'PATIENT') {
    return visitType === 'FITNESS'
      ? `/patient/fitness-plans/${planId}`
      : `/patient/treatment-plans/${planId}`
  }
  if (role === 'PHYSIOTHERAPIST') return `/physiotherapist/patient/${patientId}/treatment-plans/${planId}`
  return `/fitness/patient/${patientId}/fitness-plans/${planId}`
}
