import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth as api } from '../services/api';

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.google);

  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }
    const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (script) {
      script.addEventListener('load', () => setScriptLoaded(true));
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim(),
      callback: async (response) => {
        try {
          // We pass only response.credential to the service
          const { data } = await api.googleCallback(response.credential);
          login(data.token, data.user);
        } catch (err) {
          console.error('Login Error:', err);
          alert(err.message || 'Sign in failed');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }, [scriptLoaded]);

  if (!scriptLoaded) {
    return <button className="btn-google" disabled>Loading...</button>;
  }

  return <div ref={buttonRef} />;
}