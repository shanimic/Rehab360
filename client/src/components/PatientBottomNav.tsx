import { Home, Dumbbell, BarChart2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PatientBottomNav.css'

export type PatientNavTab = 'home' | 'exercises' | 'analytics' | 'search'

interface PatientBottomNavProps {
  activeTab: PatientNavTab
}

const NAV_ITEMS: { label: string; icon: typeof Home; tab: PatientNavTab; path: string }[] = [
  { label: 'Home', icon: Home, tab: 'home', path: '/patient' },
  { label: 'Exercises', icon: Dumbbell, tab: 'exercises', path: '/placeholder' },
  { label: 'Analytics', icon: BarChart2, tab: 'analytics', path: '/placeholder' },
  { label: 'Search', icon: Sparkles, tab: 'search', path: '/ai-search' },
]

export default function PatientBottomNav({ activeTab }: PatientBottomNavProps) {
  const navigate = useNavigate()

  return (
    <nav className="patient-nav">
      {NAV_ITEMS.map(({ label, icon: Icon, tab, path }) => (
        <button
          key={tab}
          className={`patient-nav__item${activeTab === tab ? ' patient-nav__item--active' : ''}`}
          aria-label={label}
          onClick={() => navigate(path)}
        >
          <Icon size={22} />
          <span className="patient-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
