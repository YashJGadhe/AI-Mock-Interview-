import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
      gap: '1.5rem', fontFamily: 'var(--font-family)',
    }}>
      <div style={{ fontSize: '5rem' }}>🔍</div>
      <div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.5rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
