import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import type { AxiosError } from 'axios'

import { useLoginMutation } from '@/hooks/useLoginMutation'
import AuthLayout from '../AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import StepIndicator from '../components/StepIndicator'
import PasswordField from '../components/PasswordField'
import getErrorMessage from '../components/getErrorMessage'
import type { Role, ApiRole } from '@/types'

const ROLE_TO_API: Record<Role, ApiRole> = {
  patient: 'PATIENT',
  physiotherapist: 'PHYSIOTHERAPIST',
  trainer: 'FITNESS_TRAINER',
}

const ROLE_LABEL: Record<Role, string> = {
  patient: 'Patient',
  physiotherapist: 'Physiotherapist',
  trainer: 'Fitness Trainer',
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = (location.state?.role as Role) ?? 'patient'
  const loginMutation = useLoginMutation()

  const form = useForm({
    defaultValues: { email: '', password: '' } as LoginValues,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({ email: value.email, password: value.password, role: ROLE_TO_API[role] })
      navigate('/dashboard')
    },
  })

  const errorMessage = loginMutation.isError
    ? ((loginMutation.error as AxiosError<{ detail: string }>)?.response?.data?.detail ?? 'Login failed. Please check your credentials.')
    : null

  return (
    <AuthLayout
      panelTitle="Welcome back to Rehab360"
      panelSubtitle="Log in to access your personalized rehabilitation dashboard and connect with your care team."
    >
      <StepIndicator currentStep={2} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h2 className="auth-title" style={{ marginBottom: 0 }}>Welcome back</h2>
        <Badge style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none' }}>
          {ROLE_LABEL[role]}
        </Badge>
      </div>
      <p className="auth-subtitle">Sign in to your account to continue</p>

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
        <form.Field name="email" validators={{ onChange: z.string().email('Invalid email address') }}>
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="auth-input"
                placeholder="liron@gmail.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="username"
              />
              {getErrorMessage(field.state.meta.errors[0]) && (
                <p className="auth-field__error">{getErrorMessage(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: z.string().min(1, 'Password is required') }}>
          {(field) => (
            <>
              <PasswordField
                id="password"
                label="Password"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={getErrorMessage(field.state.meta.errors[0])}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 20 }}>
                <Link to="/set-password" className="auth-link" style={{ fontSize: 13 }}>
                  Forgot Password?
                </Link>
              </div>
            </>
          )}
        </form.Field>

        {errorMessage && (
          <p className="auth-field__error" style={{ marginBottom: 12 }}>{errorMessage}</p>
        )}

        <Button type="submit" className="btn-primary" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="auth-link-row">
        Don't have an account?{' '}
        <Button variant="link" className="auth-link p-0 h-auto" style={{ fontSize: 'inherit' }}
          onClick={() => navigate('/role-select', { state: { action: 'signup' } })}>
          Sign Up
        </Button>
      </p>
    </AuthLayout>
  )
}
