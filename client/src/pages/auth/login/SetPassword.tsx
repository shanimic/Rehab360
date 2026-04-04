import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

import { useSetPasswordMutation } from '@/hooks/useSetPasswordMutation'
import AuthLayout from '../AuthLayout'
import { Button } from '@/components/ui/button'

import PasswordField from '../components/PasswordField'

const setPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SetPasswordValues = z.infer<typeof setPasswordSchema>

export default function SetPassword() {
  const navigate = useNavigate()
  const setPasswordMutation = useSetPasswordMutation()

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' } as SetPasswordValues,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: setPasswordSchema },
    onSubmit: async ({ value }) => {
      await setPasswordMutation.mutateAsync(value)
      navigate('/login')
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

      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
        <form.Field name="password" validators={{ onChange: z.string().min(8, 'Password must be at least 8 characters') }}>
          {(field) => (
            <PasswordField
              id="password"
              label="Password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]}
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]}
              autoComplete="new-password"
            />
          )}
        </form.Field>

        {setPasswordMutation.isError && (
          <p className="auth-field__error" style={{ marginBottom: 12 }}>
            Failed to update password. Please try again.
          </p>
        )}

        <Button type="submit" className="btn-primary" disabled={setPasswordMutation.isPending}>
          {setPasswordMutation.isPending ? 'Saving...' : 'Create New Password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
