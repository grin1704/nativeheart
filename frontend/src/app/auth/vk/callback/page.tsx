'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function VKCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Авторизация отменена');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Код авторизации не получен');
      return;
    }

    handleVKCallback(code);
  }, [searchParams]);

  const handleVKCallback = async (code: string) => {
    try {
      const searchParamsObj = Object.fromEntries(searchParams.entries());
      const response = await fetch('/api/auth/vk/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          device_id: searchParamsObj.device_id || '',
          state: searchParamsObj.state || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.data.user, data.data.token);
        router.push('/dashboard');
      } else {
        setStatus('error');
        setMessage(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Авторизация через ВКонтакте...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-red-600 font-medium">{message}</p>
              <div className="mt-6">
                <a
                  href="/auth/login"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Вернуться к входу
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
