import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

import { useSignUpMutation } from '@/hooks/useSignUpMutation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Role } from '@/types'

import PasswordField from '../../components/PasswordField'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
})

type SignUpValues = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  role: Role
}

export default function SignUpForm({ role }: SignUpFormProps) {
  const navigate = useNavigate()
  const signUpMutation = useSignUpMutation()

  const form = useForm({
    defaultValues: {
      fullName: '',
      password: '',
      email: '',
      mobile: '',
      dateOfBirth: '',
    } as SignUpValues,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      await signUpMutation.mutateAsync({ ...value, mobile: value.mobile ?? '', role: role === 'patient' ? 'PATIENT' : 'THERAPIST' })
      navigate('/dashboard')
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="fullName" validators={{ onChange: z.string().min(2, 'Full name must be at least 2 characters') }}>
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
            {field.state.meta.errors[0] && <p className="auth-field__error">{field.state.meta.errors[0]}</p>}
          </div>
        )}
      </form.Field>

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
              autoComplete="email"
            />
            {field.state.meta.errors[0] && <p className="auth-field__error">{field.state.meta.errors[0]}</p>}
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

      <form.Field name="dateOfBirth" validators={{ onChange: z.string().min(1, 'Date of birth is required') }}>
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
            {field.state.meta.errors[0] && <p className="auth-field__error">{field.state.meta.errors[0]}</p>}
          </div>
        )}
      </form.Field>

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', margin: '16px 0 4px' }}>
        By continuing, you agree to our{' '}
        <a href="#" className="auth-link">Terms of Use</a> and{' '}
        <a href="#" className="auth-link">Privacy Policy</a>.
      </p>

      {signUpMutation.isError && (
        <p className="auth-field__error" style={{ marginBottom: 12 }}>Sign up failed. Please try again.</p>
      )}

      <Button type="submit" className="btn-primary" disabled={signUpMutation.isPending}>
        {signUpMutation.isPending ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
