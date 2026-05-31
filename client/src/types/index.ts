import type { ReactNode } from 'react'

export type Role = 'patient' | 'physiotherapist' | 'trainer'
export type ApiRole = 'PATIENT' | 'PHYSIOTHERAPIST' | 'FITNESS_TRAINER'

export interface User {
  email: string
  role: ApiRole
}

export interface LoginRequest {
  email: string
  password: string
  role: ApiRole
}

export interface LoginResponse {
  id: string
  email: string
  role: ApiRole
  first_name: string
  last_name?: string
  token?: string
}

export interface SignUpRequest {
  user_id: string
  first_name: string
  last_name: string
  email: string
  password: string
  phone: string
  birth_date: string
  role: ApiRole
  license_number?: string
}

export interface SignUpResponse {
  first_name: string
  last_name: string
  email: string
  role: ApiRole
}

export interface AuthLayoutProps {
  children: ReactNode
  panelTitle?: string
  panelSubtitle?: string
}

export interface PageTransitionProps {
  children: ReactNode
}

export interface EyeIconProps {
  open: boolean
}

export interface RoleOption {
  id: Role
  label: string
  description: string
  icon: ReactNode
}

export interface LogoIconProps {
  size?: number
  color?: string
}

// ── Profile domain types ──────────────────────────────────────────────────────

export interface ProfileData {
  email: string
  last_name: string
  phone: string
  birth_date: string
  license_number?: string
}

export interface ActivePlan {
  plan_id: number
  goal: string
  category: string
  start_date: string
  end_date: string
  completion_percent: number
}

// ── Physiotherapist domain types ──────────────────────────────────────────────

export interface HomePatientCard {
  patient_id: string
  first_name: string
  last_name: string
  medical_diagnosis: string
  progress_percentage: number
  last_progress_update: string | null
}

export interface AllPatientItem {
  patient_id: string
  first_name: string
  last_name: string
}

export type PainTrend = 'improving' | 'stable' | 'worsening'
export type AlertType = 'pain_spike' | 'inactivity' | 'stuck' | 'milestone' | 'overexertion'
export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface PatientAlert {
  id: string
  patientId: string
  patientName: string
  message: string
  type: AlertType
  severity: AlertSeverity
}

export interface Patient {
  id: string
  name: string
  medicalDiagnosis: string
  weeklyCompliance: number
  painTrend: PainTrend
  lastReport: string
  currentPain: number
  previousPain: number
  hoursWithoutReport: number
  stableDays: number
  completionPercent: number
  effortLevel: number
}

export interface Appointment {
  id: string
  time: string
  patientName: string
  reason: string
}

export interface TreatmentPlan {
  condition: string
  startDate: string
  duration: string
  nextSession: string
}

export interface PatientDetails extends Patient {
  patientDisplayId: string
  age: number
  status: 'active' | 'inactive'
  totalExercises: number
  totalDays: number
  totalSessions: number
  overallCompletion: number
  treatmentPlan: TreatmentPlan
  trainingPlan: TreatmentPlan
}

// ── AI Search domain types ────────────────────────────────────────────────────

export type SearchMode = 'instant' | 'thinking'

export type ContentType = 'Article' | 'Clinical Guideline' | 'Exercise Guide' | 'Video'

export interface AiQuery {
  query_id: number
  query_text: string
  query_date: string
}

export interface SavedContent {
  saving_id: number
  content_id: number
  query_id: number
  content_title: string
  content_text: string | null
  content_type: ContentType
  source_url: string
  physio_verification_count: number
  trainer_verification_count: number
  created_at: string
}

export interface SourceCard {
  title: string
  url: string
  description: string
  content_type: ContentType
  physio_verification_count: number
  trainer_verification_count: number
}

export interface AiExchange {
  query_id: number
  query_content: string
  ai_summary: string
  sources: SourceCard[]
}

export type AiConversation = AiExchange[]

export interface HistoryExchange {
  query: string
  answer: string
}
export const VisitType = {
  PHYSIOTHERAPIST: "PHYSIOTHERAPIST",
  FITNESS: "FITNESS"
}

// ── Visit Summary domain types ────────────────────────────────────────────────

export interface HasPreviousPlanResponse {
  has_previous_plan: boolean
}


export interface VisitSummaryPatientData {
  patient_id: string
  patient_first_name: string
  patient_last_name: string
  phone: string
  birth_date: string
  email: string
  visit_date: string
  visit_time: string
}

export interface SessionListItem {
  session_id: number
  visit_date: string
  visit_time: string
  visit_type: string
  treatment_area: string
  medical_diagnosis: string
  description: string
  therapist_first_name: string
  therapist_last_name: string
}

export interface VisitSummaryDetails {
  patient_id: string
  patient_first_name: string
  patient_last_name: string
  phone: string | null
  birth_date: string | null
  email: string | null
  session_id: number
  visit_date: string
  visit_time: string
  visit_type: string
  treatment_area: string
  medical_diagnosis: string
  description: string
  recommendations: string | null
  therapist_first_name: string
  therapist_last_name: string
  therapist_role: string
  plan_id: number | null
}

// ── Treatment Plan domain types ───────────────────────────────────────────────

export interface TreatmentPlanContext {
  session_id: number
  medical_diagnosis: string
  visit_type: string
}

export interface PhysiotherapyExerciseItem {
  exercise_id: number
  exercise_name: string
}

export interface PlanExerciseRequest {
  exercise_id: number
  reps: number
  num_sets: number
  weight: number
  time_duration: number
  time_unit: string
  description: string | null
}

export interface CreateTreatmentPlanRequest {
  goal: string
  start_date: string
  end_date: string
  notes: string | null
  exercises: PlanExerciseRequest[]
}

export interface CreateTreatmentPlanResponse {
  plan_id: number
  session_id: number
}

export interface TreatmentPlanExerciseItem {
  exercise_id: number
  exercise_name: string
  reps: number | null
  num_sets: number | null
  weight: number | null
  time_duration: number | null
  time_unit: string | null
  description: string | null
}

export interface ExerciseReportItem {
  execution_date: string
  execution_status: boolean
  pain_level: number
  effort_level: number
  num_exe_completed: number | null
  request_for_change: string | null
  reason_for_non_performance: string | null
}

export interface ExerciseReportGroup {
  exercise_id: number
  exercise_name: string
  reports: ExerciseReportItem[]
}

export interface TreatmentPlanDetailsResponse {
  plan_id: number
  session_id: number
  medical_diagnosis: string
  visit_type: string
  goal: string
  start_date: string
  end_date: string
  notes: string | null
  exercises: TreatmentPlanExerciseItem[]
  patient_reports: ExerciseReportGroup[]
}

// ── Patient Details domain types ──────────────────────────────────────────────

export interface PatientBasicInfo {
  user_id: string
  first_name: string
  last_name: string
  phone: string
  birth_date: string
  email: string
}

export interface LatestVisitSummary {
  session_id: number
  visit_date: string
  visit_time: string
  visit_type: string
  therapist_name: string
  description: string | null
}

export interface CurrentPlanWithProgress {
  plan_id: number
  session_id: number
  medical_diagnosis: string
  start_date: string
  end_date: string
  progress_percentage: number
  last_progress_update: string | null
}

export interface PatientDetailsResponse {
  patient: PatientBasicInfo
  latest_visit_summary: LatestVisitSummary | null
  treatment_plan: CurrentPlanWithProgress | null
  fitness_plan: CurrentPlanWithProgress | null
  viewer_role: string | null
}