import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { LogoIcon } from '@/pages/auth/AuthLayout'
import './PatientTopNav.css'

const PRIMARY_ITEMS = [
  {
    label: 'Home',
    path: '/patient',
    exact: true,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'My Exercises',
    path: '/patient/my-plan',
    exact: false,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M6 4v16M18 4v16M6 12h12M4 8h2M18 8h2M4 16h2M18 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Visit Summaries',
    path: '/placeholder',
    exact: false,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Treatment Plan',
    path: '/placeholder',
    exact: false,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Training Plan',
    path: '/placeholder',
    exact: false,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const SUB_ITEMS = [
  {
    label: 'AI Search',
    path: '/placeholder',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M11 8v3M8.5 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Saved Medical Content',
    path: '/placeholder',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2"/>
        <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function PatientTopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAtomValue(authAtom)

  const closeMenu = () => setMenuOpen(false)

  function isActive(path: string, exact: boolean): boolean {
    if (path === '/placeholder') return false
    if (exact) return pathname === path
    return pathname.startsWith(path)
  }

  return (
    <>
      <header className="patient-nav">
        <div className="patient-nav__inner">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span className="patient-nav__brand">Rehab360</span>
          </div>

          <div className="flex items-center gap-3">
            {user?.first_name && (
              <span className="text-sm font-medium text-slate-500">
                {user.first_name}
              </span>
            )}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[200] flex justify-end"
          onClick={closeMenu}
          style={{ animation: 'patientNavFadeIn 0.18s ease' }}
        >
          <nav
            className="patient-nav__drawer"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'patientNavSlideIn 0.2s ease' }}
          >
            {/* Drawer header */}
            <div className="patient-nav__drawer-header">
              <div className="flex items-center gap-2">
                <LogoIcon size={24} />
                <span className="patient-nav__brand">Rehab360</span>
              </div>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <ul className="patient-nav__menu">
              {PRIMARY_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    className={`patient-nav__menu-item${isActive(item.path, item.exact) ? ' patient-nav__menu-item--active' : ''}`}
                    onClick={() => { navigate(item.path); closeMenu() }}
                  >
                    <span className="patient-nav__menu-icon">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}

              <li className="patient-nav__sub-divider" aria-hidden="true" />

              {SUB_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    className="patient-nav__menu-item patient-nav__sub-item"
                    onClick={() => { navigate(item.path); closeMenu() }}
                  >
                    <span className="patient-nav__menu-icon">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
