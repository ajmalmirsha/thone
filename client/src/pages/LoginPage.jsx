import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { label: 'Doctor', sublabel: 'Dr. Sarah Smith', email: 'dr.smith@hospital.com', password: 'doctor123' },
  { label: 'Doctor', sublabel: 'Dr. Michael Jones', email: 'dr.jones@hospital.com', password: 'doctor123' },
  { label: 'Nurse', sublabel: 'Anna Williams', email: 'nurse.anna@hospital.com', password: 'nurse123' },
  { label: 'Nurse', sublabel: 'John Carter', email: 'nurse.john@hospital.com', password: 'nurse123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setIsLoading(true);

    try {
      await login(account.email, account.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-circle" />
        <div className="login-bg-circle" />
        <div className="login-bg-circle" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🏥</div>
          <h1 className="login-title">Thone</h1>
          <p className="login-subtitle">Hospital Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <p className="login-demo-title">Quick Demo Login</p>
          <div className="login-demo-accounts">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                className="btn btn-secondary login-demo-btn"
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
              >
                <span className="demo-role">{account.label}</span>
                <span>{account.sublabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
