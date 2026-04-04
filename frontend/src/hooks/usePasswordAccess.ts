'use client';

import { useState, useCallback } from 'react';
import { apiRequest } from '../utils/api';

interface UsePasswordAccessReturn {
  verifyPassword: (pageId: string, password: string) => Promise<boolean>;
  clearAccess: (pageId: string) => Promise<void>;
  checkAccess: (pageId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const usePasswordAccess = (): UsePasswordAccessReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPassword = useCallback(async (pageId: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', `/memorial-pages/${pageId}/verify-password`, { password });
      if (response.success && response.data?.isValid) {
        return true;
      } else {
        setError('Неверный пароль');
        return false;
      }
    } catch (err) {
      setError('Произошла ошибка при проверке пароля');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAccess = useCallback(async (pageId: string): Promise<void> => {
    try {
      await apiRequest('DELETE', `/memorial-pages/${pageId}/password-access`);
    } catch (err) {
      console.error('Failed to clear password access:', err);
    }
  }, []);

  const checkAccess = useCallback(async (pageId: string): Promise<boolean> => {
    try {
      const response = await apiRequest('GET', `/memorial-pages/${pageId}/password-access`);
      return response.data?.hasAccess ?? false;
    } catch (err) {
      return false;
    }
  }, []);

  return { verifyPassword, clearAccess, checkAccess, loading, error };
};
