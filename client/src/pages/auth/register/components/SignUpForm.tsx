import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import type { AxiosError } from 'axios'

import { useSignUpMutation } from '@/hooks/useSignUpMutation'
import { Button } from '@/components/ui/button'
import type { Role, ApiRole } from '@/types'

import PasswordField from '../../components/PasswordField'
import FormTextField from './FormTextField'

const ROLE_TO_API: Record<Role, ApiRole> = {
  patient: 'PATIENT',
  physiotherapist: 'PHYSIOTHERAPIST',
  trainer: 'FITNESS_TRAINER',
}

const signUpSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(1, 'Phone number is required'),
  birth_date: z.string().min(1, 'Date of birth is required'),
  license_number: z.string().optional(),
})

type SignUpValues = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  role: Role
}

export default function SignUpForm({ role }: SignUpFormProps) {
  const navigate = useNavigate()
  const signUpMutation = useSignUpMutation()
  const needsLicense = role === 'physiotherapist' || role === 'trainer'

  const form = useForm({
    defaultValues: { first_name: '', last_name: '', email: '', password: '', phone: '', birth_date: '', license_number: '' } as SignUpValues,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      await signUpMutation.mutateAsync({
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        password: value.password,
        phone: value.phone,
        birth_date: value.birth_date,
        role: ROLE_TO_API[role],
        license_number: value.license_number || undefined,
      })
      navigate('/dashboard')
    },
  })

  const errorMessage = signUpMutation.isError
    ? ((signUpMutation.error as AxiosError<{ detail: string }>)?.response?.data?.detail ?? 'Sign up failed. Please try again.')
    : null

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="first_name" validators={{ onChange: z.string().min(1, 'First name is required') }}>
        {(field) => <FormTextField id="first_name" label="First Name" placeholder="Liron" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} autoComplete="given-name" />}
      </form.Field>

      <form.Field name="last_name" validators={{ onChange: z.string().min(1, 'Last name is required') }}>
        {(field) => <FormTextField id="last_name" label="Last Name" placeholder="Gabay" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} autoComplete="family-name" />}
      </form.Field>

      <form.Field name="email" validators={{ onChange: z.string().email('Invalid email address') }}>
        {(field) => <FormTextField id="email" label="Email" type="email" placeholder="liron@gmail.com" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} autoComplete="email" />}
      </form.Field>

      <form.Field name="password" validators={{ onChange: z.string().min(8, 'Password must be at least 8 characters') }}>
        {(field) => <PasswordField id="password" label="Password" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} autoComplete="new-password" />}
      </form.Field>

      <form.Field name="phone" validators={{ onChange: z.string().min(1, 'Phone number is required') }}>
        {(field) => <FormTextField id="phone" label="Phone Number" type="tel" placeholder="050-1234567" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} autoComplete="tel" />}
      </form.Field>

      <form.Field name="birth_date" validators={{ onChange: z.string().min(1, 'Date of birth is required') }}>
        {(field) => <FormTextField id="birth_date" label="Date of Birth" type="date" value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} />}
      </form.Field>

      {needsLicense && (
        <form.Field name="license_number">
          {(field) => <FormTextField id="license_number" label="License Number" placeholder="LIC-0000" value={field.state.value ?? ''} onChange={field.handleChange} onBlur={field.handleBlur} error={field.state.meta.errors[0]} />}
        </form.Field>
      )}

      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', margin: '16px 0 4px' }}>
        By continuing, you agree to our{' '}
        <a href="#" className="auth-link">Terms of Use</a> and{' '}
        <a href="#" className="auth-link">Privacy Policy</a>.
      </p>

      {errorMessage && (
        <p className="auth-field__error" style={{ marginBottom: 12 }}>{errorMessage}</p>
      )}

      <Button type="submit" className="btn-primary" disabled={signUpMutation.isPending}>
        {signUpMutation.isPending ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
