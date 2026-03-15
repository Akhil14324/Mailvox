import { useState, useEffect } from 'react';
import { history as historyApi } from '../services/api';
import styles from './History.module.css';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    historyApi
      .list()
      .then(({ data }) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.page}><p>Loading…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;

  return (
    <div className={styles.page}>
      <h1>Sent History</h1>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5}>No sent emails yet.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row._id}>
                  <td>{row.to}</td>
                  <td className={styles.subject}>{row.subject}</td>
                  <td><span className={row.status === 'sent' ? styles.sent : styles.failed}>{row.status}</span></td>
                  <td>{row.sentAt ? new Date(row.sentAt).toLocaleString() : '—'}</td>
                  <td>{row.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
