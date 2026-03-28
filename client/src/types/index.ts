import type { ReactNode } from 'react'

export type Role = 'patient' | 'physiotherapist' | 'trainer'
export type ApiRole = 'PATIENT' | 'THERAPIST'

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
}

export interface SignUpRequest {
  fullName: string
  email: string
  password: string
  mobile: string
  dateOfBirth: string
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
