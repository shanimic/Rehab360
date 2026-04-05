import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './styles/variables.css'

import LandingPage from './pages/auth/landing/LandingPage'
import RoleSelect from './pages/auth/register/RoleSelect'
import Login from './pages/auth/login/Login'
import SignUp from './pages/auth/register/SignUp'
import SetPassword from './pages/auth/login/SetPassword'
import PhysiotherapistHome from './pages/physiotherapist/home/PhysiotherapistHome'
import PlaceholderPage from './pages/PlaceholderPage'
import PageTransition from './components/PageTransition'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/role-select" element={<PageTransition><RoleSelect /></PageTransition>} />
      <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
      <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
      <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
      <Route path="/physiotherapist" element={<PageTransition><PhysiotherapistHome /></PageTransition>} />
      <Route path="/placeholder" element={<PageTransition><PlaceholderPage /></PageTransition>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
