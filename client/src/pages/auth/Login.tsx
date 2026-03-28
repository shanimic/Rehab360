import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import AuthLayout from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { EyeIconProps } from '@/types'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

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

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const loginMutation = useMutation({
    mutationFn: async (_data: LoginValues) => {
      // TODO: connect to API once role is included in login flow
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSuccess: () => {
      navigate('/dashboard')
    },
  })

  const form = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    } as LoginValues,
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value)
    },
  })

  return (
    <AuthLayout
      panelTitle="Welcome back to Rehab360"
      panelSubtitle="Log in to access your personalized rehabilitation dashboard and connect with your care team."
    >
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to your account to continue</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="identifier"
          validators={{ onChange: z.string().min(1, 'Email or phone number is required') }}
        >
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <Input
                id="identifier"
                type="text"
                className="auth-input"
                placeholder="liron@gmail.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="username"
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
          validators={{ onChange: z.string().min(1, 'Password is required') }}
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
                  autoComplete="current-password"
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
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Link to="/set-password" className="auth-link" style={{ fontSize: 13 }}>
                  Forget Password?
                </Link>
              </div>
            </div>
          )}
        </form.Field>

        {loginMutation.isError && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>
            Login failed. Please check your credentials.
          </p>
        )}

        <Button
          type="submit"
          className="btn-primary"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <p className="auth-link-row">
        Don't have an account?{' '}
        <Link to="/role-select" className="auth-link">Sign Up</Link>
      </p>
    </AuthLayout>
  )
}
