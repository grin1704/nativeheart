'use client';

import { useEffect, useState } from 'react';

export default function DeclineInvitationPage({
  params,
}: {
  params: { collaboratorId: string };
}) {
  const { collaboratorId: id } = params;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    declineInvitation();
  }, []);

  const declineInvitation = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/invitations/${id}/decline`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.message || 'Не удалось отклонить приглашение');
      }
    } catch {
      setStatus('error');
      setMessage('Ошибка подключения к серверу');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Обрабатываем запрос...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Приглашение отклонено</h1>
          <p className="text-gray-500 text-sm mb-8">Вы отклонили приглашение стать соавтором.</p>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">Перейти на главную</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Ошибка</h1>
        <p className="text-gray-500 text-sm mb-8">{message}</p>
        <a href="/" className="text-sm text-blue-600 hover:text-blue-800">Перейти на главную</a>
      </div>
    </div>
  );
}
