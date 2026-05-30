import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ApiRole } from '@/types'
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
import RoleRoute from './components/RoleRoute'
import ExerciseReport from './pages/patient/ExerciseReport'
import MyPlan from './pages/patient/MyPlan'
import AllVisitSummaries from './pages/all-visit-summaries/AllVisitSummaries'
import CreateVisitSummary from './pages/create-visit-summary/CreateVisitSummary'
import VisitSummaryDetail from './pages/visit-summary-detail/VisitSummaryDetail'
import CreateTreatmentPlan from './pages/create-treatment-plan/CreateTreatmentPlan'
import ViewTreatmentPlan from './pages/view-treatment-plan/ViewTreatmentPlan'
import ProfilePage from './pages/profile/ProfilePage'
import ExerciseSchedule from './pages/patient/schedule-exercise/ExerciseSchedule'

const ALL_ROLES: ApiRole[] = ['PATIENT', 'PHYSIOTHERAPIST', 'FITNESS_TRAINER']

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      {/* ── Public ── */}
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/role-select" element={<PageTransition><RoleSelect /></PageTransition>} />
      <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
      <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
      <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
      <Route path="/placeholder" element={<PageTransition><PlaceholderPage /></PageTransition>} />

      {/* ── Any authenticated role ── */}
      <Route path="/ai-search" element={<RoleRoute allowedRoles={ALL_ROLES}><PageTransition><AiSearchPage /></PageTransition></RoleRoute>} />
      <Route path="/ai-search/saved" element={<RoleRoute allowedRoles={ALL_ROLES}><PageTransition><SavedContentPage /></PageTransition></RoleRoute>} />
      <Route path="/profile" element={<RoleRoute allowedRoles={ALL_ROLES}><PageTransition><ProfilePage /></PageTransition></RoleRoute>} />

      {/* ── PATIENT ── */}
      <Route path="/patient" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><PatientHome /></PageTransition></RoleRoute>} />
      <Route path="/patient/exercise/:id" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><ExerciseReport /></PageTransition></RoleRoute>} />
      <Route path="/patient/my-plan" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><MyPlan /></PageTransition></RoleRoute>} />
      <Route path="/patient/schedule-exercise" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><ExerciseSchedule /></PageTransition></RoleRoute>} />
      <Route path="/patient/my-process" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><PatientDetails /></PageTransition></RoleRoute>} />
      <Route path="/patient/visit-summaries" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><AllVisitSummaries /></PageTransition></RoleRoute>} />
      <Route path="/patient/visit-summaries/:visitId" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><VisitSummaryDetail /></PageTransition></RoleRoute>} />
      <Route path="/patient/treatment-plans/:planId" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/patient/fitness-plans/:planId" element={<RoleRoute allowedRoles={['PATIENT']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />

      {/* ── PHYSIOTHERAPIST ── */}
      <Route path="/physiotherapist/home" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><HomePage /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><PatientDetails /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><AllVisitSummaries /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries/new" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><CreateVisitSummary /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/visit-summaries/:visitId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><VisitSummaryDetail /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/treatment-plans/:planId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/treatment-plans/new/:sessionId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><CreateTreatmentPlan /></PageTransition></RoleRoute>} />

      {/* ── FITNESS_TRAINER ── */}
      <Route path="/fitness/home" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><HomePage /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><PatientDetails /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><AllVisitSummaries /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/new" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><CreateVisitSummary /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/:visitId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><VisitSummaryDetail /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/:planId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/new/:sessionId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><CreateTreatmentPlan /></PageTransition></RoleRoute>} />

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
