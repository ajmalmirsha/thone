import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientPage from './pages/PatientPage';

function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🏥 Thone</span>
      </div>
      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="navbar-user-name">{user.name}</div>
          <div className="navbar-user-role">{user.role}</div>
        </div>
        <div className="navbar-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <button className="btn-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <ProtectedRoute>
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
