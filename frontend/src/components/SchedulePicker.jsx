import styles from './SchedulePicker.module.css';

export default function SchedulePicker({ value, onChange, min }) {
  const minStr = min || new Date().toISOString().slice(0, 16);
  return (
    <label className={styles.label}>
      Schedule send time
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minStr}
        className={styles.input}
      />
    </label>
  );
}
