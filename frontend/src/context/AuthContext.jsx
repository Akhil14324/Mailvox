import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api'; // Import your configured axios instance

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('mailvox_token') || null);
  const [loading, setLoading] = useState(!!token);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('mailvox_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mailvox_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Use the axios 'api' instance instead of 'fetch'
    api.get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}