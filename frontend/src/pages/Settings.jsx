import styles from './Settings.module.css';

export default function Settings() {
  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <p className={styles.muted}>Mailvox uses your Google account for sign-in and sending email via Gmail. No additional settings required.</p>
    </div>
  );
}
