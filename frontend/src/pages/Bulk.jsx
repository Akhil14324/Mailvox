import { useState } from 'react';
import BulkUpload from '../components/BulkUpload';
import { useGemini } from '../hooks/useGemini';
import { bulk as bulkApi } from '../services/api';
import styles from './Bulk.module.css';

export default function Bulk() {
  const [recipients, setRecipients] = useState([]);
  const [mode, setMode] = useState('same'); // 'same' | 'personalized'
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const { generateEmail, loading: generating } = useGemini();

  const handleGenerateOne = async () => {
    setError(null);
    try {
      const data = await generateEmail({
        reason: reason || 'General bulk message',
        tone: 'Professional',
        extraNotes: 'Keep it short and suitable for multiple recipients.',
      });
      setSubject(data.subject);
      setBody(data.body);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async () => {
    if (!recipients.length) {
      setError('Upload a CSV with recipients first.');
      return;
    }
    setError(null);
    setSending(true);
    setResults(null);
    try {
      if (mode === 'personalized') {
        const { data } = await bulkApi.send({
          recipients,
          personalized: true,
          reason: reason || undefined,
        });
        setResults(data.results);
      } else {
        if (!subject.trim() || !body.trim()) {
          setError('Generate or enter subject and body for same-email mode.');
          setSending(false);
          return;
        }
        const { data } = await bulkApi.send({
          recipients,
          subject,
          body,
          personalized: false,
        });
        setResults(data.results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Bulk Send</h1>
      <BulkUpload onParsed={setRecipients} />

      {recipients.length > 0 && (
        <>
          <div className={styles.mode}>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'same'}
                onChange={() => setMode('same')}
              />
              Same email to all
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'personalized'}
                onChange={() => setMode('personalized')}
              />
              Personalized per recipient
            </label>
          </div>

          {mode === 'same' && (
            <div className={styles.sameForm}>
              <label>
                Subject
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className={styles.input}
                />
              </label>
              <label>
                Body
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Email body"
                  rows={6}
                  className={styles.textarea}
                />
              </label>
              <button
                type="button"
                onClick={handleGenerateOne}
                disabled={generating}
                className={styles.genBtn}
              >
                {generating ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
          )}

          {mode === 'personalized' && (
            <label className={styles.reason}>
              Context / reason (for AI personalization)
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Event follow-up"
                className={styles.input}
              />
            </label>
          )}

          <div className={styles.tableWrap}>
            <h3>Recipients ({recipients.length})</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {recipients.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td>{r.name || '—'}</td>
                    <td>{r.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipients.length > 50 && <p className={styles.more}>+ {recipients.length - 50} more</p>}
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className={styles.sendBtn}
          >
            {sending ? 'Sending…' : 'Generate and send all'}
          </button>

          {results && (
            <div className={styles.results}>
              <h3>Results</h3>
              {results.map((r, i) => (
                <p key={i}>{r.email}: {r.status}{r.error ? ` — ${r.error}` : ''}</p>
              ))}
            </div>
          )}
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
