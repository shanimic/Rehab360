import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/variables.css';

import LandingPage from './pages/auth/LandingPage';
import RoleSelect from './pages/auth/RoleSelect';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import SetPassword from './pages/auth/SetPassword';
import PageTransition from './components/PageTransition';

function Dashboard() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ color: '#1a56db', fontSize: 32, fontWeight: 700 }}>Rehab360 Dashboard</h1>
      <p style={{ color: '#64748b' }}>Authentication complete. Dashboard coming soon.</p>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/role-select" element={<PageTransition><RoleSelect /></PageTransition>} />
      <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
      <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
      <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
      <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
