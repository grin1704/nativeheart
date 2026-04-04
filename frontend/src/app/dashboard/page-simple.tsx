'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionType: string;
}

interface MemorialPage {
  id: string;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  createdAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [memorialPages, setMemorialPages] = useState<MemorialPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Загружаем данные пользователя
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Ошибка загрузки данных пользователя');
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Загружаем памятные страницы пользователя
      const pagesResponse = await fetch('/api/memorial-pages/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setMemorialPages(pagesData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
              <p className="text-gray-600">Добро пожаловать, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Подписка: {user?.subscriptionType}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Memorial Pages */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Мои памятные страницы</h2>
              <p className="text-sm text-gray-600">
                {memorialPages.length === 0 
                  ? 'У вас пока нет памятных страниц' 
                  : `Всего страниц: ${memorialPages.length}`
                }
              </p>
            </div>
            <Link
              href="/dashboard/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              + Создать страницу
            </Link>
          </div>
          
          <div className="p-6">
            {memorialPages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет памятных страниц</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Создайте первую памятную страницу для сохранения памяти о близком человеке.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Создать первую страницу
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memorialPages.map((page) => (
                  <div key={page.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {page.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {new Date(page.birthDate).getFullYear()} - {new Date(page.deathDate).getFullYear()}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        href={`/memorial/${page.slug}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Просмотр
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        href={`/dashboard/edit/${page.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Редактировать
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}