import { useState, useEffect } from 'react';
import { schedule as scheduleApi } from '../services/api';
import styles from './Scheduled.module.css';

export default function Scheduled() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    scheduleApi
      .list()
      .then(({ data }) => setList(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this scheduled email?')) return;
    try {
      await scheduleApi.cancel(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className={styles.page}><p>Loading…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;

  return (
    <div className={styles.page}>
      <h1>Scheduled</h1>
      {list.length === 0 ? (
        <p className={styles.empty}>No scheduled emails.</p>
      ) : (
        <div className={styles.list}>
          {list.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.row}>
                <strong>To:</strong> {item.to}
              </div>
              <div className={styles.row}>
                <strong>Subject:</strong> {item.subject}
              </div>
              <div className={styles.row}>
                <strong>At:</strong> {new Date(item.scheduledAt).toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => handleCancel(item._id)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
