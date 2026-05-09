// ─────────────────────────────────────────────────────────────────────────────
// DEV ONLY — delete this file and remove the /dev-login route from App.tsx
// before shipping to production.
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { authAtom } from '@/store/authAtom'
import type { LoginResponse } from '@/types'

const DEV_TARGET = '/patient/P100/visit-summaries'

const DEV_USERS: { label: string; auth: LoginResponse }[] = [
  {
    label: 'Bob Johnson — T200 (Physiotherapist)',
    auth: { id: 'T200', email: 'bob@physio.com', role: 'PHYSIOTHERAPIST', first_name: 'Bob', last_name: 'Johnson' },
  },
  {
    label: 'Charlie Davis — F300 (Fitness Trainer)',
    auth: { id: 'F300', email: 'charlie@gym.com', role: 'FITNESS_TRAINER', first_name: 'Charlie', last_name: 'Davis' },
  },
]

export default function DevLogin() {
  const navigate = useNavigate()
  const setAuth = useSetAtom(authAtom)

  function loginAs(user: LoginResponse) {
    setAuth(user)
    navigate(DEV_TARGET)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      background: '#1a1a2e',
      fontFamily: 'monospace',
    }}>
      <div style={{
        background: '#ff4444',
        color: '#fff',
        padding: '0.4rem 1rem',
        borderRadius: '4px',
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
      }}>
        ⚠ DEV ONLY — NOT FOR PRODUCTION
      </div>

      <h1 style={{ color: '#e2e8f0', fontSize: '1.1rem', margin: 0 }}>
        Quick Dev Login → <code style={{ color: '#90cdf4' }}>{DEV_TARGET}</code>
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
        {DEV_USERS.map((u) => (
          <button
            key={u.auth.id}
            type="button"
            onClick={() => loginAs(u.auth)}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#2d3748',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}
          >
            <strong>{u.auth.id}</strong> · {u.label}
          </button>
        ))}
      </div>
    </div>
  )
}
