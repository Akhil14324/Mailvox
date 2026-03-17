import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ComposeForm from '../components/ComposeForm';
import PreviewSection from '../components/PreviewSection';
import { useGemini } from '../hooks/useGemini';
import { auth as authApi, send as sendApi, templates as templatesApi, schedule as scheduleApi } from '../services/api';

export default function Compose() {
  const location = useLocation();
  const template = location.state?.template;
  const [preview, setPreview] = useState({ subject: '', body: '' });
  const [recipient, setRecipient] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sendError, setSendError] = useState(null);
  const [sending, setSending] = useState(false);
  const [tone, setTone] = useState('Professional');

  const { generateEmail, loading: generating, error: genError } = useGemini();

  useEffect(() => {
    if (template) {
      setPreview({ subject: template.subject || '', body: template.body || '' });
    }
  }, [template]);

  // NEW: Handle connecting Gmail specifically for sending permissions
  const handleConnectGmail = () => {
    if (!window.google) {
      alert("Google script not loaded yet. Please refresh.");
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.send',
      callback: async (response) => {
        if (response.access_token) {
          try {
            await authApi.connectGmail(response.access_token);
            alert("Gmail Connected! You can now send emails.");
            setSendError(null); // Clear the error
            window.location.reload(); // Refresh to ensure the new token is active
          } catch (err) {
            alert("Failed to save Gmail connection to backend.");
          }
        }
      },
    });
    client.requestAccessToken();
  };

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
    if (!recipient) {
        alert("Please provide a recipient email.");
        return;
    }
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

      {/* UPDATED: Improved error display with Connect Button */}
      {sendError && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--error)', borderRadius: '8px', backgroundColor: 'rgba(255,0,0,0.05)' }}>
          <p style={{ color: 'var(--error)', margin: 0 }}>{sendError}</p>
          {sendError.includes('Gmail not connected') && (
            <button 
              onClick={handleConnectGmail}
              style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#6B8BAE', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Connect Gmail to Send
            </button>
          )}
        </div>
      )}
    </div>
  );
}