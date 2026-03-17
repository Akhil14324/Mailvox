import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth as api } from '../services/api';

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const { data } = await api.googleCallback(response.credential, undefined);
          login(data.token, data.user);
        } catch (err) {
          console.error(err);
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
  }, []);

  return <div ref={buttonRef} />;
}