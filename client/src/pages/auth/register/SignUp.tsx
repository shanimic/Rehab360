import { useLocation, Link } from 'react-router-dom'

import AuthLayout from '../AuthLayout'
import { Badge } from '@/components/ui/badge'
import type { Role } from '@/types'

import SignUpForm from './components/SignUpForm'

const roleLabelMap: Record<Role, string> = {
  patient: 'Patient',
  physiotherapist: 'Physiotherapist',
  trainer: 'Fitness Trainer',
}

export default function SignUp() {
  const location = useLocation()
  const role = ((location.state as { role?: Role })?.role) ?? 'patient'

  return (
    <AuthLayout
      panelTitle="Join Rehab360 today"
      panelSubtitle={`Create your ${roleLabelMap[role]} account and start your rehabilitation journey.`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h2 className="auth-title" style={{ marginBottom: 0 }}>New Account</h2>
        <Badge
          style={{
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            border: 'none',
            textTransform: 'capitalize',
          }}
        >
          {roleLabelMap[role]}
        </Badge>
      </div>
      <p className="auth-subtitle">Fill in your details to create your account</p>

      <SignUpForm role={role} />

      <p className="auth-link-row">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Log In</Link>
      </p>
    </AuthLayout>
  )
}
