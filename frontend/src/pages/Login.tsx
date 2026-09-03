import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { School, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import './Login.css';

export default function Login() {
  const { login, token, isLoading } = useAuthStore();
  const [email, setEmail] = useState('admin@school.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  if (token) return <Navigate to="/" replace />;

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
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>
      <div className="login-container">
        <div className="login-hero">
          <div className="login-hero-icon"><School size={48} /></div>
          <h1>EduSphere</h1>
          <p>Modern School Management System</p>
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Student & Teacher Portals</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Fee & Document Management</span>
            </div>
          </div>
        </div>
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your account</p>
          {error && <div className="login-error">{error}</div>}
          <label>
            <Mail size={16} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
          </label>
          <label>
            <Lock size={16} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          </label>
          <Button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="login-demo">
            <p>Demo accounts</p>
            <div className="demo-tags">
              <span>admin@school.local</span>
              <span>principal@school.local</span>
              <span>accountant@school.local</span>
              <span>teacher@school.local</span>
              <span>student@school.local</span>
              <span>parent@school.local</span>
            </div>
            <small>Password: password</small>
          </div>
        </form>
      </div>
    </div>
  );
}
