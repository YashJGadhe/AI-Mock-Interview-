import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'context/AuthContext';
import ProtectedRoute from 'components/auth/ProtectedRoute';
import AppLayout from 'layouts/AppLayout';
import AuthLayout from 'layouts/AuthLayout';

import LoginPage            from './pages/LoginPage';
import SignupPage           from './pages/SignupPage';
import DashboardPage        from './pages/DashboardPage';
import InterviewSetupPage   from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import FeedbackPage         from './pages/FeedbackPage';
import HistoryPage          from './pages/HistoryPage';
import ResourcesPage        from './pages/ResourcesPage';
import ProfilePage          from './pages/ProfilePage';

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <Spinner size={40} />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/interview/setup"   element={<InterviewSetupPage />} />
              <Route path="/interview/:id"     element={<InterviewSessionPage />} />
              <Route path="/feedback/:id"      element={<FeedbackPage />} />
              <Route path="/history"           element={<HistoryPage />} />
              <Route path="/resources"         element={<ResourcesPage />} />
              <Route path="/profile"           element={<ProfilePage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
