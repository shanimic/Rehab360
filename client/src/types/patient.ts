export interface Patient {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
  email: string
}

export type AlertType = 'warning' | 'critical' | 'info'

export interface PatientAlert {
  id: string
  patientId: string
  type: AlertType
  message: string
}

export interface VisitSummary {
  date: string
  therapistName: string
  noteSnippet: string
}

export interface Plan {
  name: string
  condition: string
  startDate: string
  endDate: string
  progressPercent: number
  nextSession: string
}

export interface PatientDetails {
  patient: Patient
  alerts: PatientAlert[]
  visitSummary: VisitSummary
  treatmentPlan: Plan
  trainingPlan: Plan
}
