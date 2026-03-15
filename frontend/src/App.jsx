import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import Bulk from './pages/Bulk';
import Templates from './pages/Templates';
import History from './pages/History';
import Scheduled from './pages/Scheduled';
import Settings from './pages/Settings';
import styles from './App.module.css';

function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mailvox_theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('mailvox_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.app}>
      <Navbar theme={theme} onThemeToggle={toggleTheme} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <PrivateRoute><Dashboard /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/compose"
            element={
              <Layout>
                <PrivateRoute><Compose /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/bulk"
            element={
              <Layout>
                <PrivateRoute><Bulk /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/templates"
            element={
              <Layout>
                <PrivateRoute><Templates /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/scheduled"
            element={
              <Layout>
                <PrivateRoute><Scheduled /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/history"
            element={
              <Layout>
                <PrivateRoute><History /></PrivateRoute>
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <PrivateRoute><Settings /></PrivateRoute>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
