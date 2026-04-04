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
