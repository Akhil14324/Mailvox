import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleAuthButton from './GoogleAuthButton';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { path: '/compose', label: 'Compose' },
  { path: '/bulk', label: 'Bulk Send' },
  { path: '/templates', label: 'Templates' },
  { path: '/scheduled', label: 'Scheduled' },
  { path: '/history', label: 'History' },
  { path: '/settings', label: 'Settings' },
];

export default function Navbar({ theme, onThemeToggle }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <Link to="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
          Mailvox
        </Link>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={styles.nav}>
        {isAuthenticated ? (
          <>
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${styles.link} ${location.pathname === path ? styles.active : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className={styles.user}>
              {user?.picture && (
                <img src={user.picture} alt="" className={styles.avatar} />
              )}
              <span className={styles.userName}>{user?.name || user?.email}</span>
              <button type="button" className={styles.logout} onClick={logout}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <div className={styles.authWrap}>
            <GoogleAuthButton />
          </div>
        )}
      </nav>
    </aside>
  );
}
