import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './styles/variables.css'

import LandingPage from './pages/auth/landing/LandingPage'
import RoleSelect from './pages/auth/register/RoleSelect'
import Login from './pages/auth/login/Login'
import SignUp from './pages/auth/register/SignUp'
import SetPassword from './pages/auth/login/SetPassword'
import PatientDetails from './pages/patient-details/PatientDetails'
import PatientHome from './pages/patient/PatientHome'
import PhysiotherapistHome from './pages/physiotherapist/home/PhysiotherapistHome'
import PlaceholderPage from './pages/PlaceholderPage'
import PageTransition from './components/PageTransition'
import ExerciseReport from './pages/patient/ExerciseReport'
import MyPlan from './pages/patient/MyPlan'
import AllVisitSummaries from './pages/all-visit-summaries/AllVisitSummaries'
import VisitSummaryDetail from './pages/visit-summary-detail/VisitSummaryDetail'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/role-select" element={<PageTransition><RoleSelect /></PageTransition>} />
      <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
      <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
      <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
      <Route path="/patient" element={<PageTransition><PatientHome /></PageTransition>} />
      <Route path="/physiotherapist" element={<PageTransition><PhysiotherapistHome /></PageTransition>} />
      <Route path="/placeholder" element={<PageTransition><PlaceholderPage /></PageTransition>} />
      <Route path="/patient/:id" element={<PageTransition><PatientDetails /></PageTransition>} />
      <Route path="/patient/exercise/:id" element={<PageTransition><ExerciseReport /></PageTransition>} />
      <Route path="/patient/my-plan" element={<PageTransition><MyPlan /></PageTransition>} />
      <Route path="/patient/:id/visit-summaries" element={<PageTransition><AllVisitSummaries /></PageTransition>} />
      <Route path="/patient/:id/visit-summaries/:visitId" element={<PageTransition><VisitSummaryDetail /></PageTransition>} />
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
