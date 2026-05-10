import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Menu, Dumbbell, Sparkles, User } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import './PatientNavbar.css'

const desktopNav = [
  { label: 'Exercises',  icon: Dumbbell, path: '/patient/my-plan' },
  { label: 'AI Search',  icon: Sparkles,  path: '/ai-search'      },
  { label: 'My Profile', icon: User,      path: '/profile'        },
]

interface PatientNavbarProps {
  /**
   * Sub-page mode: provide a title to show  ← Title  Name ☰
   * Home mode: omit title to show  Logo  [nav links]  🔔 ☰
   */
  title?: string
  /** Override the back-button handler. Defaults to navigate(-1). */
  onBack?: () => void
  /** Home mode: highlight this nav label (e.g. 'Exercises') */
  activeNavItem?: string
}

export default function PatientNavbar({
  title,
  onBack,
  activeNavItem,
}: PatientNavbarProps) {
  const navigate = useNavigate()
  const user = useAtomValue(authAtom)
  const firstName = user?.first_name ?? ''

  const isSubPage = Boolean(title)

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  /* ── Sub-page mode: ← Title  FirstName ☰ ── */
  if (isSubPage) {
    return (
      <header className="pnav pnav--sub" role="banner">
        <button
          className="pnav__icon-btn"
          onClick={handleBack}
          aria-label="Go back"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="pnav__title">{title}</h1>

        <div className="pnav__actions">
          {firstName && (
            <span className="pnav__name" aria-label={`Logged in as ${firstName}`}>
              {firstName}
            </span>
          )}
          <button
            className="pnav__icon-btn"
            aria-label="Open menu"
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
    )
  }

  /* ── Home mode: Logo  [nav links]  🔔 ☰ ── */
  return (
    <header className="pnav pnav--home" role="banner">
      <div className="pnav__logo">
        <img src="/logo.svg" alt="Rehab360" className="pnav__logo-img" />
        <span className="pnav__brand">
          Rehab<span>360</span>
        </span>
      </div>

      <nav className="pnav__desktop-nav" aria-label="Main navigation">
        {desktopNav.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            className={`pnav__nav-link${activeNavItem === label ? ' pnav__nav-link--active' : ''}`}
            type="button"
            onClick={() => navigate(path)}
            aria-current={activeNavItem === label ? 'page' : undefined}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      <div className="pnav__actions">
        <button
          className="pnav__icon-btn pnav__icon-btn--relative"
          aria-label="Notifications (3 unread)"
          type="button"
        >
          <Bell size={20} />
          <span className="pnav__badge" aria-hidden>3</span>
        </button>
        <button
          className="pnav__icon-btn"
          aria-label="Open menu"
          type="button"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
