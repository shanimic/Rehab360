import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useState } from 'react'
import AuthLayout from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { EyeIconProps } from '@/types'

const setPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SetPasswordValues = z.infer<typeof setPasswordSchema>

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

export default function SetPassword() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  const setPasswordMutation = useMutation({
    mutationFn: async (_data: SetPasswordValues) => {
      // TODO: connect to API
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSuccess: () => {
      navigate('/login')
    },
  })

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    } as SetPasswordValues,
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: setPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await setPasswordMutation.mutateAsync(value)
    },
  })

  return (
    <AuthLayout
      panelTitle="Reset your password"
      panelSubtitle="Create a new strong password for your Rehab360 account to keep it secure."
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-secondary)', display: 'flex' }}
          aria-label="Go back"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="auth-title" style={{ marginBottom: 0 }}>Set Password</h2>
      </div>

      <p className="auth-subtitle">
        Choose a new password for your account. Make sure it's at least 8 characters long.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
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

        <form.Field name="confirmPassword">
          {(field) => (
            <div className="auth-field">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="auth-input-wrap">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
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
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirm} />
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

        {setPasswordMutation.isError && (
          <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>
            Failed to update password. Please try again.
          </p>
        )}

        <Button
          type="submit"
          className="btn-primary"
          disabled={setPasswordMutation.isPending}
        >
          {setPasswordMutation.isPending ? 'Saving...' : 'Create New Password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
