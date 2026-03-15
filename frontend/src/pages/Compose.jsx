import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ComposeForm from '../components/ComposeForm';
import PreviewSection from '../components/PreviewSection';
import { useGemini } from '../hooks/useGemini';
import { send as sendApi, templates as templatesApi } from '../services/api';
import { schedule as scheduleApi } from '../services/api';

export default function Compose() {
  const location = useLocation();
  const template = location.state?.template;
  const [preview, setPreview] = useState({ subject: '', body: '' });
  const [recipient, setRecipient] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    if (template) {
      setPreview({ subject: template.subject || '', body: template.body || '' });
    }
  }, [template]);
  const [sendError, setSendError] = useState(null);
  const [sending, setSending] = useState(false);
  const [tone, setTone] = useState('Professional');

  const { generateEmail, loading: generating, error: genError } = useGemini();

  const handleGenerate = async (formData) => {
    setSendError(null);
    try {
      const data = await generateEmail(formData);
      setPreview({ subject: data.subject, body: data.body });
      setRecipient(formData.recipientEmail);
    } catch (_) {
      // error set by useGemini
    }
  };

  const handleSaveTemplate = async ({ subject, body }) => {
    const name = window.prompt('Template name');
    if (!name?.trim()) return;
    try {
      await templatesApi.create({ name: name.trim(), subject, body, tone });
      alert('Template saved.');
    } catch (err) {
      setSendError(err.message);
    }
  };

  const handleSend = async ({ subject, body }) => {
    if (!recipient) return;
    setSendError(null);
    setSending(true);
    try {
      if (scheduleTime) {
        await scheduleApi.create({
          to: recipient,
          subject,
          body,
          scheduledAt: new Date(scheduleTime).toISOString(),
        });
        setPreview({ subject: '', body: '' });
        setScheduleTime('');
        alert('Email scheduled successfully.');
      } else {
        await sendApi.email({ to: recipient, subject, body });
        setPreview({ subject: '', body: '' });
        alert('Email sent.');
      }
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '640px' }}>
      <h1>Compose</h1>
      <ComposeForm
        onGenerate={handleGenerate}
        generating={generating}
        error={genError}
        scheduleTime={scheduleTime}
        onScheduleChange={setScheduleTime}
        tone={tone}
        onToneChange={setTone}
      />
      {(preview.subject || preview.body) && (
        <PreviewSection
          subject={preview.subject}
          body={preview.body}
          onSubjectChange={(s) => setPreview((p) => ({ ...p, subject: s }))}
          onBodyChange={(b) => setPreview((p) => ({ ...p, body: b }))}
          onSend={handleSend}
          onSaveTemplate={handleSaveTemplate}
          sending={sending}
        />
      )}
      {sendError && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{sendError}</p>}
    </div>
  );
}
