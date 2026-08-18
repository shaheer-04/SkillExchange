/**
 * components/ProtectedRoute.jsx
 * Wraps the private pages. While the session is being restored it shows a
 * loader; if there is no logged-in user it redirects to /login and
 * remembers where the visitor wanted to go.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Checking your session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
