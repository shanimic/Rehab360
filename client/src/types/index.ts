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
