import { useNavigate, Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

import { useLoginMutation } from '@/hooks/useLoginMutation'
import AuthLayout from '../AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import PasswordField from '../components/PasswordField'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const form = useForm({
    defaultValues: { identifier: '', password: '' } as LoginValues,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({ email: value.identifier, password: value.password, role: 'PATIENT' })
      navigate('/dashboard')
    },
  })

  return (
    <AuthLayout
      panelTitle="Welcome back to Rehab360"
      panelSubtitle="Log in to access your personalized rehabilitation dashboard and connect with your care team."
    >
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to your account to continue</p>

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
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
              {field.state.meta.errors[0] && (
                <p className="auth-field__error">{field.state.meta.errors[0]}</p>
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
                error={field.state.meta.errors[0]}
                autoComplete="current-password"
              />
              <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 20 }}>
                <Link to="/set-password" className="auth-link" style={{ fontSize: 13 }}>
                  Forget Password?
                </Link>
              </div>
            </>
          )}
        </form.Field>

        {loginMutation.isError && (
          <p className="auth-field__error" style={{ marginBottom: 12 }}>
            Login failed. Please check your credentials.
          </p>
        )}

        <Button type="submit" className="btn-primary" disabled={loginMutation.isPending}>
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
