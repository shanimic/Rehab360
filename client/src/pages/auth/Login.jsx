import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to API
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      panelTitle="Welcome back to Rehab360"
      panelSubtitle="Log in to access your personalized rehabilitation dashboard and connect with your care team."
    >
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="identifier">Email or Mobile Number</label>
          <input
            id="identifier"
            type="text"
            className="auth-input"
            placeholder="liron@gmail.com"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            autoComplete="username"
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
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
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Link to="/set-password" className="auth-link" style={{ fontSize: 13 }}>
              Forget Password?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>

      <p className="auth-link-row">
        Don't have an account?{' '}
        <Link to="/role-select" className="auth-link">Sign Up</Link>
      </p>
    </AuthLayout>
  );
}
