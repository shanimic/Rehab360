import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormTextFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  autoComplete?: string
}

export default function FormTextField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: FormTextFieldProps) {
  return (
    <div className="auth-field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        className="auth-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
      />
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  )
}
