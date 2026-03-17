import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth as api } from '../services/api';

export default function GoogleAuthButton() {
  const { login } = useAuth();
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

    if (!window.google_initialized) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim(),
        auto_select: false, // STOP automatic login of previous account
        callback: async (response) => {
          console.log("Encoded JWT ID token: " + response.credential);
          try {
            const { data } = await api.googleCallback(response.credential);
            login(data.token, data.user);
          } catch (err) {
            console.error('Backend Auth Error:', err);
            alert('Login failed: ' + (err.message || 'Unknown error'));
          }
        },
      });
      window.google_initialized = true;
    }

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
    });
    
    // This prompts the "One Tap" UI if you want it, 
    // but we can comment it out to stay strictly with the button
    // window.google.accounts.id.prompt(); 
    
  }, [scriptLoaded]);

  if (!scriptLoaded) return <button className="btn-google">Loading...</button>;

  return <div ref={buttonRef} style={{ minHeight: '40px' }} />;
}