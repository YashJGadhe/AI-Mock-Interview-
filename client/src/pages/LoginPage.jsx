import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Alert } from 'components/ui/index';
import styles from './Auth.module.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue your interview practice</p>
      </div>

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError('')} />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth isLoading={loading} size="lg">
          Sign in
        </Button>
      </form>

      <div className={styles.divider}><span>or</span></div>

      <div className={styles.demoBox}>
        <p className={styles.demoLabel}>Try with demo account</p>
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setForm({ email: 'demo@aiinterview.com', password: 'demo123456' });
          }}
        >
          Use Demo Credentials
        </Button>
      </div>

      <p className={styles.footer}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.link}>Create one free</Link>
      </p>
    </div>
  );
};

export default LoginPage;
