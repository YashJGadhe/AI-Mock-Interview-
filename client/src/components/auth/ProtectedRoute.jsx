import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { Spinner } from 'components/ui/index';

/**
 * ProtectedRoute — redirects unauthenticated users to /login
 * Preserves the attempted URL in location state for post-login redirect
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-family)',
      }}>
        <Spinner size={48} />
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
