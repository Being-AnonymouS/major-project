import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastErrorBoundary } from './components/ToastErrorBoundary';
import { useAuth } from './hooks/useAuth';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  UnauthorizedPage,
  MentorSearchPage,
  MentorDetailPage,
  AppointmentsPage,
  MessagingPage,
  AdminPage,
} from './pages';

const FullPageLoader: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="surface-card flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-700">
        <span className="spinner"></span>
        Loading Mentor Connect...
      </div>
    </div>
  );
};

const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

const LegacyMentorDetailRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <Navigate to="/app/mentors" replace />;
  }

  return <Navigate to={`/app/mentors/${id}`} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastErrorBoundary>
          <AuthProvider>
            <SocketProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route
                    path="/login"
                    element={
                      <GuestOnlyRoute>
                        <LoginPage />
                      </GuestOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestOnlyRoute>
                        <RegisterPage />
                      </GuestOnlyRoute>
                    }
                  />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="mentors" element={<MentorSearchPage />} />
                    <Route path="mentors/:id" element={<MentorDetailPage />} />
                    <Route path="appointments" element={<AppointmentsPage />} />
                    <Route path="messages" element={<MessagingPage />} />
                    <Route 
                      path="admin" 
                      element={
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminPage />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Additional protected routes will be added in future tasks */}
                  </Route>

                  {/* Legacy route compatibility */}
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/mentors" element={<Navigate to="/app/mentors" replace />} />
                  <Route path="/mentors/:id" element={<LegacyMentorDetailRedirect />} />
                  <Route path="/appointments" element={<Navigate to="/app/appointments" replace />} />
                  <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
                  <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
              </Router>
            </SocketProvider>
          </AuthProvider>
        </ToastErrorBoundary>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
