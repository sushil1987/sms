import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

export default function Login() {
  const { login, token, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@school.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>School Management System</h1>
        <p>Sign in to your account</p>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="demo-credentials">
          <small>Demo: admin@school.local / password</small>
        </div>
      </form>
    </div>
  );
}
