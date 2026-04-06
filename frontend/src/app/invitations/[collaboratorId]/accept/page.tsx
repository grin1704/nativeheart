'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptInvitationPage({
  params,
}: {
  params: { collaboratorId: string };
}) {
  const router = useRouter();
  const { collaboratorId: id } = params;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth_required'>('loading');
  const [message, setMessage] = useState('');
  const [pageSlug, setPageSlug] = useState('');

  useEffect(() => {
    acceptInvitation();
  }, []);

  const acceptInvitation = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setStatus('auth_required');
      return;
    }

    try {
      const res = await fetch(`/api/invitations/${id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        const slug = data.data?.memorialPage?.slug || data.data?.collaborator?.memorialPage?.slug;
        if (slug) setPageSlug(slug);
      } else {
        setStatus('error');
        setMessage(data.message || 'Не удалось принять приглашение');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Принимаем приглашение...</p>
        </div>
      </div>
    );
  }

  if (status === 'auth_required') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Войдите в аккаунт</h1>
          <p className="text-gray-500 text-sm mb-8">
            Чтобы принять приглашение, необходимо войти в аккаунт или зарегистрироваться.
          </p>
          <div className="space-y-3">
            <a
              href={`/auth/login?redirect=/invitations/${id}/accept`}
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Войти
            </a>
            <a
              href={`/auth/register?redirect=/invitations/${id}/accept`}
              className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Зарегистрироваться
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">Приглашение принято</h1>
          <p className="text-gray-500 text-sm mb-8">
            Вы стали соавтором памятной страницы.
          </p>
          <div className="space-y-3">
            {pageSlug && (
              <a
                href={`/memorial/${pageSlug}`}
                className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Перейти на страницу
              </a>
            )}
            <a
              href="/dashboard"
              className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Мои страницы
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Ошибка</h1>
        <p className="text-gray-500 text-sm mb-8">{message || 'Не удалось принять приглашение. Возможно, ссылка устарела.'}</p>
        <a href="/" className="text-sm text-blue-600 hover:text-blue-800">Перейти на главную</a>
      </div>
    </div>
  );
}
