import { useCallback, useState } from 'react';
import { generate } from '../services/api';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateEmail = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await generate.email(payload);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateEmail, loading, error };
}
