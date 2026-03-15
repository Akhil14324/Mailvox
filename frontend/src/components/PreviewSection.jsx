import { useState, useEffect } from 'react';
import styles from './PreviewSection.module.css';

export default function PreviewSection({ subject, body, onSubjectChange, onBodyChange, onSend, onSaveTemplate, sending }) {
  const [localSubject, setLocalSubject] = useState(subject ?? '');
  const [localBody, setLocalBody] = useState(body ?? '');

  useEffect(() => {
    setLocalSubject(subject ?? '');
    setLocalBody(body ?? '');
  }, [subject, body]);

  const handleSubjectBlur = () => onSubjectChange?.(localSubject);
  const handleBodyBlur = () => onBodyChange?.(localBody);

  return (
    <section className={styles.section}>
      <h3 className={styles.divider}>AI Preview</h3>
      <label className={styles.label}>
        Subject
        <input
          type="text"
          value={localSubject}
          onChange={(e) => setLocalSubject(e.target.value)}
          onBlur={handleSubjectBlur}
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        Body
        <textarea
          value={localBody}
          onChange={(e) => setLocalBody(e.target.value)}
          onBlur={handleBodyBlur}
          rows={12}
          className={styles.textarea}
        />
      </label>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => onSend?.({ subject: localSubject, body: localBody })}
          disabled={sending}
          className={styles.sendBtn}
        >
          {sending ? 'Sending…' : 'Send email'}
        </button>
        {onSaveTemplate && (
          <button
            type="button"
            onClick={() => onSaveTemplate({ subject: localSubject, body: localBody })}
            className={styles.templateBtn}
          >
            Save as template
          </button>
        )}
      </div>
    </section>
  );
}
