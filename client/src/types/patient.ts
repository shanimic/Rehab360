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
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  FITNESS = 'FITNESS',
}

export interface DailyExerciseItem {
  exercise_id: number
  exercise_name: string
  visit_type: VisitType
  reps: number
  execution_status: boolean
  num_sets: number
  text_instructions: string
}

export interface WeeklyCompletion {
  EXECOMP: number
  EXETDW: number
}

export interface DailyCompletion {
  completed_sum: number
  total: number
}

export interface PatientHomeData {
  daily_exercises: DailyExerciseItem[]
  weekly_completion: WeeklyCompletion
  fitness_percentage: number
  physiotherapist_percentage: number
  daily_completions: DailyCompletion
}

export interface MyPlan {
  exercise_id: number
  exercise_name: string
  visit_type: VisitType
  reps: number
  num_sets: number
  execution_status: boolean
  ex_video_url?: string
  text_instructions: string
}

export interface WeeklyScheduleItem {
  exercise_id: number
  exercise_name: string
  visit_type: VisitType
  reps: number
  num_sets: number
  weight?: number
  time_duration: number
  time_unit: string
  session_id?: number
  plan_id?: number
}

export interface MyPlanResponse {
  today_exercises: MyPlan[]
  tomorrow_exercises: MyPlan[]
}

export interface WeeklyDayPlan {
  date: string
  day_label: string
  exercises: MyPlan[]
}

export interface WeeklyPlanResponse {
  days: WeeklyDayPlan[]
}
