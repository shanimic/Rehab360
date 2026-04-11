import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PlaceholderPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, fontFamily: 'var(--font-family)', background: 'var(--color-background)' }}>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Coming Soon</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  )
}
