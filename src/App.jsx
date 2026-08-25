import { Routes, Route, Navigate } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { HostNewSession } from './pages/HostNewSession';
import { HostSession } from './pages/HostSession';
import { HostDashboard } from './pages/HostDashboard';
import { HostReport } from './pages/HostReport';
import { Join } from './pages/Join';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="plai-section">Chargement…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/join/:code" element={<Join />} />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/new"
          element={
            <ProtectedRoute>
              <HostNewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/session/:id"
          element={
            <ProtectedRoute>
              <HostSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/report"
          element={
            <ProtectedRoute>
              <HostReport />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/host/dashboard" replace />} />
        <Route path="*" element={<div className="plai-section">Page introuvable.</div>} />
      </Routes>
      <Footer />
    </>
  );
}
