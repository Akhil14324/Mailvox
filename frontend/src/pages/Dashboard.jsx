import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <h1>Dashboard</h1>
      <p className={styles.muted}>Quick links</p>
      <div className={styles.links}>
        <Link to="/compose" className={styles.card}>Compose</Link>
        <Link to="/bulk" className={styles.card}>Bulk Send</Link>
        <Link to="/templates" className={styles.card}>Templates</Link>
        <Link to="/scheduled" className={styles.card}>Scheduled</Link>
        <Link to="/history" className={styles.card}>History</Link>
      </div>
    </div>
  );
}
