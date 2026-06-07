import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { useRequestNavigation } from '@/hooks/useRequestNavigation'
import { useLogout } from '@/hooks/useLogout'
import { LogoIcon } from '@/pages/auth/AuthLayout'
import './TopNav.css'

const STAFF_MENU_ITEMS = [
  {
    label: 'Home',
    path: '',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'AI Search',
    path: '/ai-search',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M11 8v3M8.5 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Saved Content',
    path: '/ai-search/saved',
    subItem: true,
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'My Profile',
    path: '/profile',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

function getPatientMenuItems(patientId: string | undefined) {
  return [
    {
      label: 'Home',
      path: '/patient',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'My Plan',
      path: '/patient/my-plan',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M6.5 6.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5S10.38 9 9 9 6.5 7.88 6.5 6.5Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20v-1a5 5 0 0 1 5-5h.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 12v8m-3-3 3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'My Process',
      path: '/patient/my-process',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'AI Search',
      path: '/ai-search',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 8v3M8.5 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Saved Content',
      path: '/ai-search/saved',
      subItem: true,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ]
}

function getHomePath(role: string | undefined): string {
  if (role === 'PATIENT') return '/patient'
  if (role === 'PHYSIOTHERAPIST') return '/physiotherapist/home'
  if (role === 'FITNESS_TRAINER') return '/fitness/home'
  return '/'
}

export default function TopNav() {
  const auth = useAtomValue(authAtom)
  const requestNavigation = useRequestNavigation()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const isPatient = auth?.role === 'PATIENT'
  const menuItems = !auth ? [] : isPatient ? getPatientMenuItems(auth.id) : STAFF_MENU_ITEMS
  const homePath = getHomePath(auth?.role)

  const closeMenu = () => setMenuOpen(false)

  const handleNavigation = (item: { label: string; path: string }) => {
    closeMenu()
    requestNavigation(() => navigate(item.label === 'Home' ? homePath : item.path))
  }

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  return createPortal(
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <div className="flex items-center gap-2.5">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <LogoIcon size={28} />
            <span className="top-nav__brand">Rehab360</span>
          </div>

          {auth && (
            <span className="top-nav__doctor">
              {`${auth.first_name} ${auth.last_name ?? ''}`.trim()}
            </span>
          )}
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[200] flex justify-start"
          onClick={closeMenu}
          style={{ animation: 'fadeIn 0.18s ease' }}
        >
          <nav
            className="w-72 h-full bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideIn 0.2s ease' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LogoIcon size={24} />
                <span className="top-nav__brand">Rehab360</span>
              </div>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <ul className="flex flex-col gap-1 p-3 flex-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  {item.subItem ? (
                    <button
                      className="w-full flex items-center gap-3 pl-10 pr-4 py-3 rounded-xl text-slate-700 font-medium text-sm text-left hover:bg-slate-50 active:bg-blue-50 active:text-blue-700 active:scale-[0.98] transition-all border-0 bg-transparent cursor-pointer"
                      onClick={() => handleNavigation(item)}
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ) : (
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-medium text-sm text-left hover:bg-slate-50 active:bg-blue-50 active:text-blue-700 active:scale-[0.98] transition-all border-0 bg-transparent cursor-pointer"
                      onClick={() => handleNavigation(item)}
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="p-3 border-t border-slate-100">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-medium text-sm text-left hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all border-0 bg-transparent cursor-pointer"
                onClick={handleLogout}
              >
                <span>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </>,
    document.body
  )
}
