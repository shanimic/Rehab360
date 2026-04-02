import { useState } from 'react'

import { EyeIcon } from '@/components/ui/eye-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  autoComplete?: string
}

export default function PasswordField({ id, label, value, onChange, onBlur, error, autoComplete }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-field">
      <Label htmlFor={id}>{label}</Label>
      <div className="auth-input-wrap">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className="auth-input auth-input--has-icon"
          placeholder="••••••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
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
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  )
}
