import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './styles/variables.css'

import LandingPage from './pages/auth/landing/LandingPage'
import RoleSelect from './pages/auth/register/RoleSelect'
import Login from './pages/auth/login/Login'
import SignUp from './pages/auth/register/SignUp'
import SetPassword from './pages/auth/login/SetPassword'
import PatientDetails from './pages/patient-details/PatientDetails'
import PatientHome from './pages/patient/PatientHome'
import HomePage from './pages/home/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'
import AiSearchPage from './pages/ai-search/AiSearchPage'
import SavedContentPage from './pages/ai-search/SavedContentPage'
import PageTransition from './components/PageTransition'
import ExerciseReport from './pages/patient/ExerciseReport'
import MyPlan from './pages/patient/MyPlan'
import AllVisitSummaries from './pages/all-visit-summaries/AllVisitSummaries'
import CreateVisitSummary from './pages/create-visit-summary/CreateVisitSummary'
import VisitSummaryDetail from './pages/visit-summary-detail/VisitSummaryDetail'
import CreateTreatmentPlan from './pages/create-treatment-plan/CreateTreatmentPlan'
import ViewTreatmentPlan from './pages/view-treatment-plan/ViewTreatmentPlan'
import ProfilePage from './pages/profile/ProfilePage'
import ExerciseSchedule from './pages/patient/schedule-exercise/ExerciseSchedule'
import DevLogin from './pages/dev/DevLogin' // DEV ONLY — remove before production


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
      <Route path="/physiotherapist/home" element={<PageTransition><HomePage /></PageTransition>} />
      <Route path="/fitness/home" element={<PageTransition><HomePage /></PageTransition>} />
      <Route path="/placeholder" element={<PageTransition><PlaceholderPage /></PageTransition>} />
      <Route path="/ai-search" element={<PageTransition><AiSearchPage /></PageTransition>} />
      <Route path="/ai-search/saved" element={<PageTransition><SavedContentPage /></PageTransition>} />
      <Route path="/patient/:id" element={<PageTransition><PatientDetails /></PageTransition>} />
      <Route path="/patient/exercise/:id" element={<PageTransition><ExerciseReport /></PageTransition>} />
      <Route path="/patient/my-plan" element={<PageTransition><MyPlan /></PageTransition>} />
      <Route path="/patient/schedule-exercise" element={<PageTransition><ExerciseSchedule /></PageTransition>} />
      <Route path="/patient/:id/visit-summaries" element={<PageTransition><AllVisitSummaries /></PageTransition>} />
      <Route path="/patient/:id/visit-summaries/new" element={<PageTransition><CreateVisitSummary /></PageTransition>} />
      <Route path="/patient/:id/visit-summaries/:visitId" element={<PageTransition><VisitSummaryDetail /></PageTransition>} />
      <Route path="/physiotherapist/patient/:patientId/treatment-plans/new/:sessionId" element={<PageTransition><CreateTreatmentPlan /></PageTransition>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/new/:sessionId" element={<PageTransition><CreateTreatmentPlan /></PageTransition>} />
      <Route path="/patient/:id/treatment-plans/:planId" element={<PageTransition><ViewTreatmentPlan /></PageTransition>} />

      {/* ── PATIENT viewing own data ── */}
      <Route path="/patient/my-process" element={<PageTransition><PatientDetails /></PageTransition>} />
      <Route path="/patient/visit-summaries" element={<PageTransition><AllVisitSummaries /></PageTransition>} />
      <Route path="/patient/visit-summaries/:visitId" element={<PageTransition><VisitSummaryDetail /></PageTransition>} />
      <Route path="/patient/treatment-plans/:planId" element={<PageTransition><ViewTreatmentPlan /></PageTransition>} />
      <Route path="/patient/fitness-plans/:planId" element={<PageTransition><ViewTreatmentPlan /></PageTransition>} />

      {/* ── PHYSIOTHERAPIST viewing a selected patient ── */}
      <Route path="/physiotherapist/patient/:patientId" element={<PageTransition><PatientDetails /></PageTransition>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries" element={<PageTransition><AllVisitSummaries /></PageTransition>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries/new" element={<PageTransition><CreateVisitSummary /></PageTransition>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries/:visitId" element={<PageTransition><VisitSummaryDetail /></PageTransition>} />
      <Route path="/physiotherapist/patient/:patientId/treatment-plans/:planId" element={<PageTransition><ViewTreatmentPlan /></PageTransition>} />

      {/* ── FITNESS_TRAINER viewing a selected patient ── */}
      <Route path="/fitness/patient/:patientId" element={<PageTransition><PatientDetails /></PageTransition>} />
      <Route path="/fitness/patient/:patientId/visit-summaries" element={<PageTransition><AllVisitSummaries /></PageTransition>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/new" element={<PageTransition><CreateVisitSummary /></PageTransition>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/:visitId" element={<PageTransition><VisitSummaryDetail /></PageTransition>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/:planId" element={<PageTransition><ViewTreatmentPlan /></PageTransition>} />

      <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
      <Route path="/dev-login" element={<DevLogin />} />{/* DEV ONLY */}
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
