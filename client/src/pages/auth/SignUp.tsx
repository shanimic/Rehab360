import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import AuthLayout from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { EyeIconProps, Role } from '@/types'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
})

type SignUpValues = z.infer<typeof signUpSchema>

const roleLabelMap: Record<Role, string> = {
  patient: 'Patient',
  physiotherapist: 'Physiotherapist',
  trainer: 'Fitness Trainer',
}

function EyeIcon({ open }: EyeIconProps) {
  return open ? (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ) : (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = (location.state?.role as Role) || 'patient'
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const signUpMutation = useMutation({
    mutationFn: async (_data: SignUpValues) => {
      // TODO: connect to API
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSuccess: () => {
      navigate('/dashboard')
    },
  })

  const form = useForm({
    defaultValues: {
      fullName: '',
      password: '',
      email: '',
      mobile: '',
      dateOfBirth: '',
    } as SignUpValues,
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await signUpMutation.mutateAsync(value)
    },
  })

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

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="fullName"
          validators={{ onChange: z.string().min(2, 'Full name must be at least 2 characters') }}
        >
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                className="auth-input"
                placeholder="lironga"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="name"
              />
              {field.state.meta.errors.length > 0 && (
                <p style={{ color: 'var(--color-error)', fontSize: 13, marginTop: 4 }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: z.string().min(8, 'Password must be at least 8 characters') }}
        >
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="password">Password</Label>
              <div className="auth-input-wrap">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input--has-icon"
                  placeholder="••••••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p style={{ color: 'var(--color-error)', fontSize: 13, marginTop: 4 }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{ onChange: z.string().email('Invalid email address') }}
        >
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
                autoComplete="email"
              />
              {field.state.meta.errors.length > 0 && (
                <p style={{ color: 'var(--color-error)', fontSize: 13, marginTop: 4 }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="mobile">
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                className="auth-input"
                placeholder="0543789542"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="tel"
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="dateOfBirth"
          validators={{ onChange: z.string().min(1, 'Date of birth is required') }}
        >
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="dateOfBirth">Date Of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="auth-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 && (
                <p style={{ color: 'var(--color-error)', fontSize: 13, marginTop: 4 }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', margin: '16px 0 4px' }}>
          By continuing, you agree to our{' '}
          <a href="#" className="auth-link">Terms of Use</a> and{' '}
          <a href="#" className="auth-link">Privacy Policy</a>.
        </p>

        {signUpMutation.isError && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>
            Sign up failed. Please try again.
          </p>
        )}

        <Button
          type="submit"
          className="btn-primary"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      <p className="auth-link-row">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Log In</Link>
      </p>
    </AuthLayout>
  )
}
