import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth as api } from '../services/api';

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check for the Google script every 500ms until found
  useEffect(() => {
    const checkScript = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
        clearInterval(checkScript);
      }
    }, 500);
    return () => clearInterval(checkScript);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current) return;

    // Use a global flag to prevent "Multiple calls" warning
    if (!window.google_initialized) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim(),
        callback: async (response) => {
          try {
            const { data } = await api.googleCallback(response.credential);
            login(data.token, data.user);
          } catch (err) {
            console.error('Sign-in Error:', err);
            alert(err.message || 'Sign in failed');
          }
        },
        // Force the UX mode to be handled carefully by Google
        ux_mode: 'popup'
      });
      window.google_initialized = true;
    }

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }, [scriptLoaded]);

  if (!scriptLoaded) {
    return (
      <button className="btn-google" disabled>
        Loading Google Auth...
      </button>
    );
  }

  return <div ref={buttonRef} />;
}