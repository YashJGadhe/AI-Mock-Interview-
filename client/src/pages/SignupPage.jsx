import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Alert } from 'components/ui/index';
import styles from './Auth.module.css';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setApiError(result.error);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    error: errors[name],
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start practicing interviews for free today</p>
      </div>

      {apiError && (
        <Alert type="error" message={apiError} onClose={() => setApiError('')} />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input label="Full name" placeholder="Alex Johnson" {...field('name')} required />
        <Input label="Email address" type="email" placeholder="you@example.com" {...field('email')} required />
        <Input label="Password" type="password" placeholder="Min 6 characters" {...field('password')} required />
        <Input label="Confirm password" type="password" placeholder="Repeat password" {...field('confirm')} required />

        <Button type="submit" fullWidth isLoading={loading} size="lg">
          Create Account
        </Button>
      </form>

      <p className={styles.terms}>
        By signing up, you agree to our <Link to="/terms" className={styles.link}>Terms</Link> and{' '}
        <Link to="/privacy" className={styles.link}>Privacy Policy</Link>.
      </p>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  );
};

export default SignupPage;
