import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleAuthButton from '../components/GoogleAuthButton';
import styles from './Landing.module.css';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Mailvox</h1>
        <p className={styles.subtitle}>AI-powered email automation. Compose, schedule, and send with Gmail.</p>
        {isAuthenticated ? (
          <Link to="/compose" className={styles.cta}>Go to Compose</Link>
        ) : (
          <GoogleAuthButton />
        )}
      </div>
    </div>
  );
}
