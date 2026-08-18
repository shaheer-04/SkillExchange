/**
 * context/AuthContext.jsx
 * Holds the logged-in user, the JWT and the login / register / logout
 * actions. Any component can read it with the useAuth() hook.
 *
 * The token is kept in localStorage so a page reload does not log the
 * user out. On start-up the token is verified against the backend
 * (GET /api/auth/me); if it is invalid or expired it is discarded.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  TOKEN_KEY,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  /* Restore the session when the app is opened or reloaded */
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = localStorage.getItem(TOKEN_KEY);

      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!cancelled) {
          setUser(me);
          setToken(stored);
        }
      } catch {
        // token expired or invalid -> clean up silently
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await registerUser(details);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /** Used after a profile update so the navbar shows the new name. */
  const updateUser = useCallback((updated) => setUser(updated), []);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user, token, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}

export default AuthContext;
