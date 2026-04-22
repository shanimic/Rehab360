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

export enum VisitType {
  PHYSIOTHERAPIST = 'physiotherapist',
  FITNESS = 'fitness',
}

export interface DailyExerciseItem {
  exerciseId: number
  exerciseName: string
  visitType: VisitType
  reps: number
  executionStatus: boolean
}

export interface WeeklyCompletion {
  exeComp: number
  exeTdw: number
}

export interface DailyCompletion {
  completedSum: number
  total: number
}
export interface PatientHomeData {
  dailyExercises: DailyExerciseItem[]
  weeklyCompletion: WeeklyCompletion
  fitnessPercentage: number
  physiotherapistPercentage: number
  dailyCompletions: DailyCompletion
}

export interface MyPlan {
  exercise_id: number,
  exercise_name: string,
  visit_type: VisitType
  reps: number,
  execution_status: boolean,
  ex_video_url?: string,
  text_instructions: string,
}
