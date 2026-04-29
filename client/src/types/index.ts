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
  rehabType: string
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

export const VisitType = {
  PHYSIOTHERAPIST: "PHYSIOTHERAPIST",
  FITNESS: "FITNESS"
}

// ── Visit Summary domain types ────────────────────────────────────────────────

export interface VisitSummaryPatientData {
  patient_id: string
  patient_first_name: string
  patient_last_name: string
  phone: string
  birth_date: string
  email: string
  plan_id: number | null
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