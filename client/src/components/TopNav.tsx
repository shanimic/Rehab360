import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { LogoIcon } from '@/pages/auth/AuthLayout'
import './TopNav.css'

const MENU_ITEMS = [
  {
    label: 'Home',
    path: '', // resolved to role-specific path at render time
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'All Patients',
    path: '/placeholder',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'AI Search',
    path: '/ai-search',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M11 8v3M8.5 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function getHomePath(role: string | undefined): string {
  if (role === 'PHYSIOTHERAPIST') return '/physiotherapist/home'
  if (role === 'FITNESS_TRAINER') return '/fitness/home'
  return '/'
}

export default function TopNav() {
  const auth = useAtomValue(authAtom)
  const displayName = auth ? `${auth.first_name} ${auth.last_name}`.trim() : ''
  const homePath = getHomePath(auth?.role)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span className="top-nav__brand">Rehab360</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {displayName && (
              <span className="hidden sm:block text-sm font-medium text-slate-500">
                {displayName}
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

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[200] flex justify-end"
          onClick={closeMenu}
          style={{ animation: 'fadeIn 0.18s ease' }}
        >
          {/* Drawer */}
          <nav
            className="w-72 h-full bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideIn 0.2s ease' }}
          >
            {/* Drawer header */}
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
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <ul className="flex flex-col gap-1 p-3 flex-1">
              {MENU_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-medium text-sm text-left hover:bg-slate-50 active:bg-blue-50 active:text-blue-700 active:scale-[0.98] transition-all border-0 bg-transparent cursor-pointer"
                    onClick={() => { navigate(item.label === 'Home' ? homePath : item.path); closeMenu() }}
                  >
                    <span className="text-slate-400">{item.icon}</span>
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
