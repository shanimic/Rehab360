import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ApiRole } from '@/types'
import './styles/variables.css'
import PageTransition from './components/PageTransition'
import RoleRoute from './components/RoleRoute'
import UnsavedChangesModal from './components/UnsavedChangesModal'

const LandingPage        = React.lazy(() => import('./pages/auth/landing/LandingPage'))
const RoleSelect         = React.lazy(() => import('./pages/auth/register/RoleSelect'))
const Login              = React.lazy(() => import('./pages/auth/login/Login'))
const SignUp             = React.lazy(() => import('./pages/auth/register/SignUp'))
const SetPassword        = React.lazy(() => import('./pages/auth/login/SetPassword'))
const PatientDetails     = React.lazy(() => import('./pages/patient-details/PatientDetails'))
const PatientHome        = React.lazy(() => import('./pages/patient/PatientHome'))
const HomePage           = React.lazy(() => import('./pages/home/HomePage'))
const PlaceholderPage    = React.lazy(() => import('./pages/PlaceholderPage'))
const AiSearchPage       = React.lazy(() => import('./pages/ai-search/AiSearchPage'))
const SavedContentPage   = React.lazy(() => import('./pages/ai-search/SavedContentPage'))
const ExerciseReport     = React.lazy(() => import('./pages/patient/ExerciseReport'))
const MyPlan             = React.lazy(() => import('./pages/patient/MyPlan'))
const AllVisitSummaries  = React.lazy(() => import('./pages/all-visit-summaries/AllVisitSummaries'))
const CreateVisitSummary = React.lazy(() => import('./pages/create-visit-summary/CreateVisitSummary'))
const VisitSummaryDetail = React.lazy(() => import('./pages/visit-summary-detail/VisitSummaryDetail'))
const CreateTreatmentPlan = React.lazy(() => import('./pages/create-treatment-plan/CreateTreatmentPlan'))
const ViewTreatmentPlan  = React.lazy(() => import('./pages/view-treatment-plan/ViewTreatmentPlan'))
const ProfilePage        = React.lazy(() => import('./pages/profile/ProfilePage'))
const ExerciseSchedule   = React.lazy(() => import('./pages/patient/schedule-exercise/ExerciseSchedule'))

const ALL_ROLES: ApiRole[] = ['PATIENT', 'PHYSIOTHERAPIST', 'FITNESS_TRAINER']

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <React.Suspense fallback={null}>
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
      <Route path="/physiotherapist/patient/:patientId/fitness-plans/:planId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/physiotherapist/patient/:patientId/treatment-plans/new/:sessionId" element={<RoleRoute allowedRoles={['PHYSIOTHERAPIST']}><PageTransition><CreateTreatmentPlan /></PageTransition></RoleRoute>} />

      {/* ── FITNESS_TRAINER ── */}
      <Route path="/fitness/home" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><HomePage /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><PatientDetails /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><AllVisitSummaries /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/new" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><CreateVisitSummary /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/visit-summaries/:visitId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><VisitSummaryDetail /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/:planId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/treatment-plans/:planId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><ViewTreatmentPlan /></PageTransition></RoleRoute>} />
      <Route path="/fitness/patient/:patientId/fitness-plans/new/:sessionId" element={<RoleRoute allowedRoles={['FITNESS_TRAINER']}><PageTransition><CreateTreatmentPlan /></PageTransition></RoleRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </React.Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <UnsavedChangesModal />
    </BrowserRouter>
  )
}
