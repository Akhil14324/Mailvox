import { useCallback, useState } from 'react';
import styles from './BulkUpload.module.css';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = header.findIndex((h) => h === 'name');
  const emailIdx = header.findIndex((h) => h === 'email');
  if (emailIdx === -1) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const email = values[emailIdx];
    if (!email) continue;
    const name = nameIdx >= 0 ? values[nameIdx] || '' : '';
    const customFields = {};
    header.forEach((key, idx) => {
      if (key !== 'name' && key !== 'email' && values[idx]) customFields[key] = values[idx];
    });
    rows.push({ name, email, customFields: Object.keys(customFields).length ? customFields : undefined });
  }
  return rows;
}

export default function BulkUpload({ onParsed }) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = useCallback(
    (file) => {
      setError(null);
      if (!file || !file.name.endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rows = parseCSV(e.target.result);
          if (rows.length === 0) setError('No valid rows (need at least "email" column).');
          else onParsed(rows);
        } catch (err) {
          setError('Invalid CSV format.');
        }
      };
      reader.readAsText(file);
    },
    [onParsed]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDrag(true);
  };

  const onDragLeave = () => setDrag(false);

  const onInputChange = (e) => {
    handleFile(e.target?.files?.[0]);
    e.target.value = '';
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.zone} ${drag ? styles.drag : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={onInputChange}
          className={styles.input}
          id="bulk-csv"
        />
        <label htmlFor="bulk-csv" className={styles.label}>
          Drag & drop CSV here or click to upload
        </label>
        <p className={styles.hint}>Columns: name, email, and optional custom fields</p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
