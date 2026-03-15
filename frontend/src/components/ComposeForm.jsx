import { useState } from 'react';
import styles from './ComposeForm.module.css';

const TONES = ['Professional', 'Friendly', 'Formal', 'Casual', 'Assertive', 'Apologetic'];

export default function ComposeForm({
  onSubmit,
  onGenerate,
  generating,
  error,
  scheduleTime,
  onScheduleChange,
  tone: controlledTone,
  onToneChange,
}) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [toneState, setToneState] = useState('Professional');
  const [extraNotes, setExtraNotes] = useState('');
  const tone = controlledTone ?? toneState;
  const setTone = onToneChange ? (v) => { setToneState(v); onToneChange(v); } : setToneState;

  const handleGenerate = () => {
    onGenerate({
      recipientEmail: recipient,
      subject: subject || undefined,
      reason,
      tone,
      extraNotes: extraNotes || undefined,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ recipient, subject, reason, tone, extraNotes });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Recipient email
        <input
          type="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="name@example.com"
          required
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        Subject (optional — AI can generate)
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Leave blank to generate"
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        Reason / context
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Following up on the project proposal"
          rows={3}
          className={styles.textarea}
        />
      </label>
      <label className={styles.label}>
        Tone
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className={styles.select}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        Extra notes (optional)
        <textarea
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="Any additional instructions for the AI"
          rows={2}
          className={styles.textarea}
        />
      </label>
      {onScheduleChange && (
        <label className={styles.label}>
          Schedule (optional)
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => onScheduleChange(e.target.value)}
            className={styles.input}
            min={new Date().toISOString().slice(0, 16)}
          />
        </label>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className={styles.generateBtn}
      >
        {generating ? 'Generating…' : 'Generate with AI'}
      </button>
    </form>
  );
}
