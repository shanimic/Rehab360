import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

interface NavTab {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  activePattern: RegExp
}

const TABS: NavTab[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/physiotherapist',
    activePattern: /^\/physiotherapist$/,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/placeholder',
    activePattern: /^\/physiotherapist\/patient\//,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'chats',
    label: 'Chats',
    path: '/placeholder',
    activePattern: /^\/chats/,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const isActive = tab.activePattern.test(pathname)
        return (
          <button
            key={tab.id}
            className={`bottom-nav__tab${isActive ? ' bottom-nav__tab--active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
          >
            <span className="bottom-nav__icon">{tab.icon}</span>
            <span className="bottom-nav__label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
