import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ) : (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

const roleLabelMap = {
  patient: 'Patient',
  physiotherapist: 'Physiotherapist',
  trainer: 'Fitness Trainer',
};

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'patient';

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    password: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to API
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      panelTitle="Join Rehab360 today"
      panelSubtitle={`Create your ${roleLabelMap[role]} account and start your rehabilitation journey.`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h2 className="auth-title" style={{ marginBottom: 0 }}>New Account</h2>
        <span style={{
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontSize: 12,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 20,
          textTransform: 'capitalize',
        }}>
          {roleLabelMap[role]}
        </span>
      </div>
      <p className="auth-subtitle">Fill in your details to create your account</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            className="auth-input"
            placeholder="lironga"
            value={form.fullName}
            onChange={set('fullName')}
            autoComplete="name"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input--has-icon"
              placeholder="••••••••••••"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="liron@gmail.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            type="tel"
            className="auth-input"
            placeholder="0543789542"
            value={form.mobile}
            onChange={set('mobile')}
            autoComplete="tel"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="dateOfBirth">Date Of Birth</label>
          <input
            id="dateOfBirth"
            type="date"
            className="auth-input"
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
            required
          />
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', margin: '16px 0 4px' }}>
          By continuing, you agree to our{' '}
          <a href="#" className="auth-link">Terms of Use</a> and{' '}
          <a href="#" className="auth-link">Privacy Policy</a>.
        </p>

        <button type="submit" className="btn-primary">
          Sign Up
        </button>
      </form>

      <p className="auth-link-row">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Log In</Link>
      </p>
    </AuthLayout>
  );
}
