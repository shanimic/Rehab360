import { useNavigate, useLocation } from 'react-router-dom'

import { LogoIcon } from '../AuthLayout'
import { Button } from '@/components/ui/button'
import StepIndicator from '../components/StepIndicator'
import type { RoleOption, Role } from '@/types'
import './RoleSelect.css'

const roles: RoleOption[] = [
  {
    id: 'patient',
    label: 'Patient',
    description: 'Track your recovery and connect with your care team',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'physiotherapist',
    label: 'Physiotherapist',
    description: 'Manage patient treatment plans and progress',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'trainer',
    label: 'Fitness Trainer',
    description: 'Create and monitor exercise programs for clients',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" fill="currentColor"/>
      </svg>
    ),
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const action = (location.state?.action as 'login' | 'signup') ?? 'signup'

  const handleSelect = (roleId: Role) => {
    const destination = action === 'login' ? '/login' : '/signup'
    navigate(destination, { state: { role: roleId } })
  }

  return (
    <div className="role-select">
      <div className="role-select__content">
        <div className="role-select__logo">
          <LogoIcon size={48} />
          <span className="role-select__brand">Rehab360</span>
        </div>

        <div className="role-select__card">
          <StepIndicator currentStep={1} />

          <h2 className="role-select__title">Who are you?</h2>
          <p className="role-select__subtitle">Select your role to get started</p>

          <div className="role-select__options">
            {roles.map((role) => (
              <button
                key={role.id}
                className="role-option"
                onClick={() => handleSelect(role.id)}
              >
                <span className="role-option__icon">{role.icon}</span>
                <span className="role-option__info">
                  <span className="role-option__label">{role.label}</span>
                  <span className="role-option__desc">{role.description}</span>
                </span>
                <svg className="role-option__arrow" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>

          <p className="role-select__login">
            {action === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Button
              variant="link"
              className="role-select__link p-0 h-auto"
              onClick={() => navigate('/role-select', { state: { action: action === 'login' ? 'signup' : 'login' } })}
            >
              {action === 'login' ? 'Sign Up' : 'Log In'}
            </Button>
          </p>
        </div>
      </div>

      <div className="role-select__bg-circle role-select__bg-circle--1" />
      <div className="role-select__bg-circle role-select__bg-circle--2" />
    </div>
  )
}
